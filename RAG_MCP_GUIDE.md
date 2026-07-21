# 📚 RAG Knowledge Base & MCP Registry Guide

## Overview

Your AgentForge system now has **two complementary knowledge systems**:

### 1. **RAG Knowledge Base** (ChromaDB)
- **Purpose**: Stores code templates & patterns for agent generation
- **Auto-indexing**: Yes, when agents are forged
- **Query**: Used to augment Gemini prompts with relevant examples

### 2. **MCP Registry** (In-Memory)
- **Purpose**: Centralized directory of all available tools
- **Auto-registration**: Yes, when agents are forged
- **Discovery**: Search, filter, and browse available MCP tools

---

## How It Works When You Create An Agent

### **Step 1: Agent Creation** 
```
User enters prompt → Backend /api/forge
```

### **Step 2: Code Generation**
```
Gemini generates agent.py + tools_server.py
```

### **Step 3: Dual Indexing** ✨ NEW
```
├─ RAG Knowledge Base
│  └─ Indexes: User prompt + generated code
│     └─ Used for future agent synthesis
│
└─ MCP Registry  
   └─ Extracts: @mcp.tool() decorated functions
      └─ Registers: Tool metadata for discovery
```

### **Step 4: Available for Reuse**
```
Next agent creation can leverage:
- Previous agent patterns (RAG)
- Available tools (MCP Registry)
```

---

## Data Structure

### **RAG Document Example**
```python
{
  "id": "custom_agent_1721582400",
  "category": "user_forged",
  "title": "Bitcoin Price Tracker Agent",
  "content": "# User Prompt: Track Bitcoin price...\n\n# agent.py\nimport requests...\n"
}
```

### **MCP Server Example**
```python
{
  "id": "agent_1721582400",
  "name": "Forged Agent Tools",
  "description": "FastMCP tool server for: Track Bitcoin price...",
  "transport": "stdio",
  "tools": [
    {
      "name": "get_crypto_price",
      "signature": "get_crypto_price(symbol: str = 'bitcoin') -> dict",
      "description": "Fetches real-time price in USD"
    }
  ],
  "category": "user_forged",
  "prompt": "Track Bitcoin price every hour..."
}
```

---

## API Endpoints

### **📖 RAG Knowledge Base**

#### List all RAG documents
```
GET /api/knowledge-base/documents
→ Returns: Total indexed documents count
```

#### Search RAG knowledge base
```
GET /api/knowledge-base/search?q=bitcoin
→ Returns: Relevant code patterns from vector store
```

---

### **🔧 MCP Registry**

#### List all MCP servers
```
GET /api/registry/servers
→ Returns: All pre-built + user-forged MCP servers
```

#### List all MCP tools
```
GET /api/registry/tools
→ Returns: Tools grouped by category
   - financial
   - weather
   - news_scraper
   - notification
   - execution
   - general
```

#### Search MCP tools
```
GET /api/registry/search?q=price
→ Returns: Matching tools with server info
```

#### Registry statistics
```
GET /api/registry/stats
→ Returns: Total servers, tools, categories
```

#### List by category
```
GET /api/registry/categories
→ Returns: Pre-built vs User-forged breakdown
```

---

## Current State

### **Pre-Built Resources** (Seeded)

#### RAG Templates (8 documents)
1. Google ADK Single Agent
2. Google ADK Multi-Agent Orchestrator
3. FastMCP Specifications
4. Financial/Crypto APIs
5. Weather/Geo APIs
6. Tech News Scraping
7. Security & AST Validation
8. Output Templates

#### MCP Servers (3 servers)
1. **CryptoSentinel** - Price tracking, alerts (2 tools)
2. **WeatherAdvisor** - Weather data, outfit recommendations (2 tools)
3. **HN Scraper** - News fetching, article summarization (2 tools)

---

## Example Workflow

### **Creating Agent #1: Bitcoin Tracker**
```
1. User: "Track Bitcoin price every hour"
2. Forge creates agent.py + tools_server.py
3. RAG indexes: The agent code + prompt
4. MCP Registry registers: get_crypto_price, send_alert tools
5. Next forge uses these as templates/patterns
```

### **Creating Agent #2: Stock Monitor**
```
1. User: "Monitor AAPL stock price"
2. Forge queries RAG for "price" patterns
3. RAG finds: Bitcoin tracker code (similar structure)
4. Forge uses as reference for synthesis
5. Forge queries MCP Registry for financial tools
6. Registry suggests: get_crypto_price (can adapt for stocks)
7. New agent is created + registered
```

---

## Best Practices

### ✅ **DO**
- Let agents auto-index to RAG (**currently enabled**)
- Let tools auto-register to MCP Registry (**currently enabled**)
- Search RAG before synthesis (enhances quality)
- Browse Registry to understand available tools
- Reuse pre-built patterns for faster generation

### ❌ **DON'T**
- Manually clear RAG unless you want to reset
- Assume tools are available without registering
- Ignore Registry when looking for existing tools
- Create duplicate tools (check Registry first)

---

## Storage Efficiency

| Component | Size | Type |
|-----------|------|------|
| RAG (ChromaDB) | ~0.18 MB | Persistent |
| MCP Registry | ~1-2 KB | In-Memory |
| Generated Agents | 0 MB | Streamed (not stored) |

> **Note**: Registry is in-memory. On backend restart, only pre-built servers remain. User-forged servers are re-indexed from generated agents if they're still in 3-agent cache.

---

## Integration with Agent Generation Pipeline

```
┌─────────────────────────────────────┐
│     User Prompt                     │
│ "Build a crypto price tracker"      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Stage 1: Requirement Analyzer       │
│ (Gemini JSON Mode)                  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Stage 2: Architecture Designer      │
│ (ADK Blueprint)                     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Stage 3: Code Generator (RAG)       │
│ ► Query RAG for patterns ◄──────┐   │
│ ► Gemini + ChromaDB synthesis    │   │
└─────────────┬───────────────────┼───┘
              │                   │
              ▼                   ▼
         agent.py        RAG retrieves similar
        tools_server.py  agent patterns
        requirements.txt
              │
              ▼
┌─────────────────────────────────────┐
│ Stage 4: Validator + Execution      │
│ ► AST check                         │
│ ► Subprocess test                   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Auto-Indexing (NEW)                 │
│ ► Add to RAG Knowledge Base         │
│ ► Register tools in MCP Registry    │
└─────────────┬───────────────────────┘
              │
              ▼
        ✅ Agent Ready
```

---

## Testing the System

### Check MCP Registry
```bash
curl http://localhost:8000/api/registry/servers
curl http://localhost:8000/api/registry/tools
curl http://localhost:8000/api/registry/stats
```

### Search for tools
```bash
curl http://localhost:8000/api/registry/search?q=price
```

### Check RAG Knowledge Base
```bash
curl http://localhost:8000/api/knowledge-base/documents
curl http://localhost:8000/api/knowledge-base/search?q=bitcoin
```

---

## Future Enhancements

- [ ] Persistent MCP Registry (database)
- [ ] Tool versioning & changelog
- [ ] RAG document deprecation (TTL)
- [ ] Tool dependency graph
- [ ] Performance metrics per tool
- [ ] Community tool marketplace
- [ ] Tool usage analytics

---

**Ready to forge! 🚀**
