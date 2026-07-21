import React, { useState } from 'react';
import { Server, Terminal, Code2, Globe, Cpu, Check, Copy } from 'lucide-react';

export default function MCPServerDocsSection() {
  const [activeServer, setActiveServer] = useState('crypto');
  const [copied, setCopied] = useState(false);

  const mcpServers = [
    {
      id: 'crypto',
      name: 'CryptoSentinel MCP Server',
      transport: 'stdio',
      toolsCount: 2,
      description: 'FastMCP tool server implementing CoinGecko REST APIs for real-time crypto price tracking & alert triggers.',
      tools: [
        { name: 'get_crypto_price(symbol: str)', desc: 'Returns current price in USD, 24h change, and volume.' },
        { name: 'send_alert(target: str, message: str)', desc: 'Sends webhook or log notification when threshold is breached.' }
      ],
      code: `from fastmcp import FastMCP
import httpx

mcp = FastMCP("CryptoSentinel")

@mcp.tool()
async def get_crypto_price(symbol: str = "bitcoin") -> dict:
    """Fetches real-time price from CoinGecko API."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd")
        return resp.json()

@mcp.tool()
def send_alert(target: str, message: str) -> bool:
    """Dispatches real-time alert payload."""
    print(f"[ALERT -> {target}] {message}")
    return True`
    },
    {
      id: 'weather',
      name: 'WeatherAdvisor MCP Server',
      transport: 'stdio',
      toolsCount: 2,
      description: 'Provides live meteorological data and outfit decision heuristics for major metropolitan areas.',
      tools: [
        { name: 'fetch_city_weather(city: str)', desc: 'Retrieves current temperature (°C), humidity, and precipitation.' },
        { name: 'recommend_attire(temp_c: float)', desc: 'Determines umbrella & clothing recommendations.' }
      ],
      code: `from fastmcp import FastMCP

mcp = FastMCP("WeatherAdvisor")

@mcp.tool()
def fetch_city_weather(city: str) -> dict:
    """Fetches city weather metrics."""
    return {"city": city, "temp_c": 32.0, "humidity": 78, "rain": True}

@mcp.tool()
def recommend_attire(temp_c: float, rain: bool) -> str:
    """Calculates clothing recommendation."""
    if rain:
        return "Carry an umbrella and light waterproof jacket."
    return "Wear light breathable cotton attire."`
    },
    {
      id: 'hn',
      name: 'HN Scraper MCP Server',
      transport: 'HTTP / SSE',
      toolsCount: 2,
      description: 'Scrapes frontpage technical articles from Hacker News, returning structured JSON for LLM summarization.',
      tools: [
        { name: 'fetch_hn_top3()', desc: 'Returns top 3 story titles, URLs, score, and comment count.' },
        { name: 'summarize_article(url: str)', desc: 'Fetches raw article body text for RAG indexing.' }
      ],
      code: `from fastmcp import FastMCP
import httpx

mcp = FastMCP("HNScraper", host="0.0.0.0", port=8000)

@mcp.tool()
async def fetch_hn_top3() -> list:
    """Fetches top 3 Hacker News story IDs and metadata."""
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
        ids = resp.json()[:3]
        return [f"https://news.ycombinator.com/item?id={i}" for i in ids]`
    }
  ];

  const current = mcpServers.find(s => s.id === activeServer);

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-container" id="mcp-docs">
      <div className="section-header text-center">
        <div className="section-micro-badge">
          <Server size={12} className="text-zinc-400" />
          <span>FastMCP Tool Protocols</span>
        </div>
        <h2 className="section-title">MCP Server & Tool Registry</h2>
        <p className="section-subtitle">
          Explore production Model Context Protocol (MCP) servers synthesized by AgentForge with stdio & HTTP/SSE transport.
        </p>
      </div>

      <div className="mcp-docs-wrapper glass-card">
        
        {/* Left Server Selector */}
        <div className="mcp-sidebar">
          <span className="sidebar-title">Synthesized MCP Servers</span>
          {mcpServers.map((srv) => (
            <button
              key={srv.id}
              type="button"
              className={`mcp-server-btn ${activeServer === srv.id ? 'active' : ''}`}
              onClick={() => setActiveServer(srv.id)}
            >
              <div className="server-btn-header">
                <Server size={16} className="text-white" />
                <span className="server-name">{srv.name}</span>
              </div>
              <div className="server-btn-meta">
                <span className="meta-pill"><Terminal size={10} /> {srv.transport}</span>
                <span className="meta-pill">{srv.toolsCount} Tools</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Documentation & Code View */}
        <div className="mcp-doc-content">
          <div className="doc-top-bar">
            <div>
              <h3>{current.name}</h3>
              <p className="doc-desc">{current.description}</p>
            </div>
            
            <button type="button" className="copy-code-btn" onClick={handleCopy}>
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy Spec"}</span>
            </button>
          </div>

          {/* Tools List */}
          <div className="mcp-tools-spec-box">
            <span className="spec-heading"><Code2 size={13} /> Registered MCP Tools</span>
            <div className="tools-spec-grid">
              {current.tools.map((t, idx) => (
                <div key={idx} className="tool-spec-card">
                  <span className="tool-sig">{t.name}</span>
                  <span className="tool-doc">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Inspector */}
          <div className="mcp-code-window">
            <div className="code-window-bar">
              <span className="term-dot red" />
              <span className="term-dot yellow" />
              <span className="term-dot green" />
              <span className="code-filename">tools_server.py (FastMCP Protocol)</span>
            </div>
            <pre className="code-body">
              <code>{current.code}</code>
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
}
