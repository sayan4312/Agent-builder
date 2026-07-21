import os
import json
import re
from typing import Dict, Any
from services.mcp_runner import MCPRunner
from services.llm_provider import generate_text_pro

def _build_agent_profile(agent_prompt: str, agent_code: str, tools_code: str) -> str:
    prompt_summary = agent_prompt.strip() or "No build prompt was provided."
    agent_lines = len([line for line in agent_code.splitlines() if line.strip()])
    tool_lines = len([line for line in tools_code.splitlines() if line.strip()])
    tool_count = len(re.findall(r"@mcp\.tool\(\)", tools_code))

    return f"""AGENT PROFILE
- Build prompt: {prompt_summary}
- Agent source lines: {agent_lines}
- Tool server source lines: {tool_lines}
- Declared MCP tools: {tool_count}

ANSWERING RULES
1. If the user asks who you are, explain that you are the forged AgentForge agent built from the provided prompt.
2. If the user asks what you can do, answer from the build prompt, agent code, and tool code.
3. If the user asks about your architecture, mention the agent file, tool server, and any visible capabilities.
4. If the user asks about limitations, be honest about missing information or missing tools.
5. If the user asks something unrelated, still answer normally, but remain in character as this specific forged agent.
"""


def execute_agent_chat(message: str, agent_code: str = "", tools_code: str = "", agent_prompt: str = "") -> Dict[str, Any]:
    """
    Executes live user query against the forged AI agent using Gemini 2.0 Flash + FastMCP tools.
    Dynamically generates structured card responses and tool call telemetry.
    """
    agent_profile = _build_agent_profile(agent_prompt, agent_code, tools_code)

    # 1. Dynamic Gemini Agent Execution
    try:
        prompt_context = f"""You are an AI Agent with the following custom Python implementation:
You must answer questions about yourself, your build, your tools, your architecture, and your limits.

{agent_profile}

--- AGENT CODE ---
{agent_code if agent_code else '# Dynamic LlmAgent'}

--- TOOLS CODE ---
{tools_code if tools_code else '# Dynamic FastMCP Tools'}

User query: "{message}"

Respond concisely in role as this agent. If the user is asking about your identity or build, answer directly and clearly. If they ask about your tools, architecture, or limitations, use the provided profile and code context. Do not invent tools that are not present."""

        reply_text = generate_text_pro(prompt_context, mode="general")
        words = message.split()
        action_name = words[0].lower() if words else "process"
        target_name = words[1].lower() if len(words) > 1 else "query"

        return {
            "type": "general",
            "text": reply_text,
            "queryText": message
        }
    except Exception as e:
        print(f"[WARN] Chat provider exception: {e}")

    # 2. Dynamic Fallback Telemetry (Parametrized dynamically by user message)
    words = message.split()
    action = words[0] if words else "execute"
    target = words[1] if len(words) > 1 else "task"
    tool_name = f"FastMCP.{action.lower()}_{target.lower()}_tool()"

    return {
        "type": "general",
        "text": f"Agent received: '{message}'. Processing...",
        "queryText": message
    }
