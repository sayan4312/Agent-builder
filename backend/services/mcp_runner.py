import os
import sys
import tempfile
import subprocess
import json
import time
from typing import Dict, Any, Optional

class MCPRunner:
    """Manages temporary FastMCP tool server execution."""
    
    @staticmethod
    def run_mcp_tool(tools_code: str, tool_name: str, args: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Executes a specific tool function defined inside tools_code in an isolated python execution environment."""
        if not tools_code or not tool_name:
            return {"success": False, "result": "Invalid tools_code or tool_name"}

        runner_script = f"""
import sys
import json

{tools_code}

try:
    if '{tool_name}' in globals():
        fn = globals()['{tool_name}']
        res = fn(**{json.dumps(args)})
        print("MCP_TOOL_RESULT_START")
        print(json.dumps({{"success": True, "result": res}}))
        print("MCP_TOOL_RESULT_END")
    else:
        print("MCP_TOOL_RESULT_START")
        print(json.dumps({{"success": False, "result": f"Tool '{tool_name}' not found in tools server."}}))
        print("MCP_TOOL_RESULT_END")
except Exception as e:
    print("MCP_TOOL_RESULT_START")
    print(json.dumps({{"success": False, "result": f"Tool execution error: {{str(e)}}"}}))
    print("MCP_TOOL_RESULT_END")
"""
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as tmp:
                tmp.write(runner_script)
                tmp_path = tmp.name

            proc = subprocess.run(
                [sys.executable, tmp_path],
                capture_output=True,
                text=True,
                timeout=10
            )

            stdout = proc.stdout
            if "MCP_TOOL_RESULT_START" in stdout and "MCP_TOOL_RESULT_END" in stdout:
                raw_json = stdout.split("MCP_TOOL_RESULT_START")[1].split("MCP_TOOL_RESULT_END")[0].strip()
                return json.loads(raw_json)
            
            output = proc.stdout if proc.stdout else proc.stderr
            return {"success": True, "result": output.strip()}

        except subprocess.TimeoutExpired:
            return {"success": False, "result": "Execution timeout (10s limit exceeded)"}
        except Exception as ex:
            return {"success": False, "result": f"MCP Runner Exception: {str(ex)}"}
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
