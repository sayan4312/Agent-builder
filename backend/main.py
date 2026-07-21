import os
import sys
import json
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv

# Ensure backend folder is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from services.forge_service import generate_agent_pipeline, create_project_zip
from services.chat_service import execute_agent_chat
from services.rag_service import rag_engine
from services.mcp_registry import mcp_registry

app = FastAPI(
    title="AgentForge API",
    description="Google AI Stack Multi-Agent Generation Engine",
    version="2.0.0"
)

# Enable CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

class RunRequest(BaseModel):
    code: str

class DownloadRequest(BaseModel):
    agent_py: str
    mcp_py: str
    req_txt: str

class ChatRequest(BaseModel):
    message: str
    agent_code: str = ""
    tools_code: str = ""
    agent_prompt: str = ""

@app.on_event("startup")
def startup_event():
    print("[INIT] [AgentForge API] Initializing backend services...")
    if rag_engine:
        rag_engine.seed_knowledge_base()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "engine": "Gemini 2.0 Flash + ADK",
        "rag": "ChromaDB Active",
        "mcp": "FastMCP Active"
    }

@app.get("/api/rag/search")
def search_rag(q: str = ""):
    """Queries live ChromaDB vector store and returns real vector matches."""
    if rag_engine:
        results = rag_engine.search_vectors(q)
        return {"success": True, "query": q, "vectors": results}
    return {"success": False, "vectors": []}

@app.post("/api/forge")
def forge_agent(req: PromptRequest):
    """Streams SSE events for the 4 pipeline stages."""
    def event_stream():
        for event in generate_agent_pipeline(req.prompt):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.post("/api/chat")
def chat_agent(req: ChatRequest):
    """Executes chat query against forged agent with live tool execution."""
    result = execute_agent_chat(req.message, req.agent_code, req.tools_code, req.agent_prompt)
    return result

@app.post("/api/run")
def run_agent_code(req: RunRequest):
    """Executes Python agent code in a temporary sandbox."""
    import tempfile
    import subprocess
    import sys

    try:
        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as tmp:
            tmp.write(req.code)
            tmp_path = tmp.name

        proc = subprocess.run([sys.executable, tmp_path], capture_output=True, text=True, timeout=10)
        output = proc.stdout if proc.stdout else proc.stderr
        os.remove(tmp_path)
        return {"success": True, "output": output}
    except Exception as e:
        return {"success": False, "output": f"Execution error: {str(e)}"}

@app.post("/api/download")
def download_zip(req: DownloadRequest):
    """Generates downloadable .zip package containing agent.py, tools_server.py, requirements.txt, and README.md."""
    zip_bytes = create_project_zip({
        "agent_py": req.agent_py,
        "mcp_py": req.mcp_py,
        "req_txt": req.req_txt
    })
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=agentforge_project.zip"}
    )

# ========== MCP REGISTRY & KNOWLEDGE BASE ENDPOINTS ==========

@app.get("/api/registry/servers")
def list_mcp_servers():
    """Lists all registered MCP tool servers (pre-built & user-forged)."""
    if not mcp_registry:
        return {"success": False, "servers": []}
    
    return {
        "success": True,
        "servers": mcp_registry.list_all_servers(),
        "count": len(mcp_registry.registry)
    }

@app.get("/api/registry/tools")
def list_mcp_tools():
    """Lists all available MCP tools grouped by category."""
    if not mcp_registry:
        return {"success": False, "tools": {}}
    
    return {
        "success": True,
        "tools": mcp_registry.export_tool_catalog(),
        "total_tools": mcp_registry.get_stats()["total_tools"]
    }

@app.get("/api/registry/search")
def search_mcp_tools(q: str = ""):
    """Search for MCP tools by name or description."""
    if not mcp_registry or not q:
        return {"success": False, "results": []}
    
    results = mcp_registry.search_tools(q)
    return {
        "success": True,
        "query": q,
        "results": results,
        "count": len(results)
    }

@app.get("/api/registry/stats")
def registry_statistics():
    """Get MCP registry statistics."""
    if not mcp_registry:
        return {"success": False, "stats": {}}
    
    return {
        "success": True,
        "stats": mcp_registry.get_stats()
    }

@app.get("/api/registry/categories")
def list_server_categories():
    """List servers by category (pre_built vs user_forged)."""
    if not mcp_registry:
        return {"success": False, "categories": {}}
    
    return {
        "success": True,
        "pre_built": mcp_registry.list_servers_by_category("pre_built"),
        "user_forged": mcp_registry.list_servers_by_category("user_forged"),
        "stats": mcp_registry.get_stats()
    }

@app.get("/api/knowledge-base/documents")
def list_rag_documents():
    """Lists all RAG knowledge base documents."""
    if not rag_engine or not rag_engine.collection:
        return {"success": False, "documents": []}
    
    try:
        count = rag_engine.collection.count()
        return {
            "success": True,
            "total_documents": count,
            "message": f"RAG knowledge base contains {count} indexed documents for code synthesis"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/knowledge-base/search")
def search_rag_knowledge(q: str = ""):
    """Search RAG knowledge base for relevant code patterns."""
    if not rag_engine or not q:
        return {"success": False, "results": []}
    
    results = rag_engine.search_vectors(q)
    return {
        "success": True,
        "query": q,
        "results": results,
        "count": len(results)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
