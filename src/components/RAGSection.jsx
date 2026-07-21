import React, { useState, useEffect } from 'react';
import { Database, Search, Code2, Layers, Cpu, X, Copy, Check, ExternalLink } from 'lucide-react';

export default function RAGSection({ activePrompt }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [liveVectors, setLiveVectors] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const categories = ['All', 'ADK Agents', 'FastMCP Tools', 'API Connectors', 'Security & AST', 'Output Templates'];

  useEffect(() => {
    const queryTerm = searchQuery.trim() || activePrompt || "";
    fetch(`http://localhost:8000/api/rag/search?q=${encodeURIComponent(queryTerm)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.vectors && data.vectors.length > 0) {
          setLiveVectors(data.vectors);
          setIsBackendConnected(true);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, [searchQuery, activePrompt]);

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawVectorDB = [
    {
      id: 'adk-llm-agent',
      name: 'Google ADK Single Agent Pattern (google.adk.Agent)',
      category: 'ADK Agents',
      baseScore: 98.4,
      dim: '1536-dim vector',
      hash: '0x7f8a9b2c',
      keywords: ['agent', 'adk', 'llm', 'google', 'gemini'],
      snippet: `from google.genai import genai
from google.adk.agents import LlmAgent

def build_single_agent(name: str):
    return LlmAgent(
        name=name,
        model="gemini-2.0-flash",
        instruction="You are an autonomous AI Agent execution loop."
    )`
    },
    {
      id: 'adk-multi-agent',
      name: 'Google ADK Multi-Agent Orchestrator (Sequential & Parallel)',
      category: 'ADK Agents',
      baseScore: 97.9,
      dim: '1536-dim vector',
      hash: '0x8b9c0d1e',
      keywords: ['multi', 'sequential', 'parallel', 'orchestrator', 'pipeline'],
      snippet: `from google.adk.orchestrators import SequentialAgent, ParallelAgent

pipeline = SequentialAgent(
    name="research_pipeline",
    agents=["researcher_agent", "analyst_agent", "reporter_agent"]
)`
    },
    {
      id: 'fastmcp-stdio-server',
      name: 'FastMCP Specifications & Transport (stdio / sse)',
      category: 'FastMCP Tools',
      baseScore: 95.1,
      dim: '1536-dim vector',
      hash: '0x3c4d5e6f',
      keywords: ['mcp', 'tools', 'fastmcp', 'server', 'stdio', 'sse'],
      snippet: `from fastmcp import FastMCP

mcp = FastMCP("AgentForgeTools")

@mcp.tool()
def fetch_api_data(query: str) -> dict:
    """Tool function with type hints and docstrings for MCP transport."""
    return {"status": "SUCCESS"}

if __name__ == "__main__":
    mcp.run(transport="stdio")`
    },
    {
      id: 'financial-api-connector',
      name: 'Financial & Crypto API Connector (CoinGecko / Yahoo Finance)',
      category: 'API Connectors',
      baseScore: 96.2,
      dim: '1536-dim vector',
      hash: '0x2b3c4d5e',
      keywords: ['finance', 'crypto', 'btc', 'stock', 'price', 'yahoo', 'coingecko'],
      snippet: `import requests

def get_btc_price_usd() -> float:
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    res = requests.get(url, timeout=5).json()
    return float(res.get("bitcoin", {}).get("usd", 0.0))`
    },
    {
      id: 'weather-geo-connector',
      name: 'Weather & Geo API Connector (Open-Meteo)',
      category: 'API Connectors',
      baseScore: 94.8,
      dim: '1536-dim vector',
      hash: '0x1a2b3c4d',
      keywords: ['weather', 'geo', 'delhi', 'temp', 'open-meteo'],
      snippet: `import requests

def get_city_forecast(city: str) -> dict:
    res = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1").json()
    return res.get("results", [{}])[0]`
    },
    {
      id: 'ast-syntax-verifier',
      name: 'Python AST Syntax & Security Evaluator (ast.parse)',
      category: 'Security & AST',
      baseScore: 99.1,
      dim: '1536-dim vector',
      hash: '0x9d8c7b6a',
      keywords: ['ast', 'syntax', 'security', 'evaluator', 'python', 'parse'],
      snippet: `import ast

def verify_python_code(code_str: str) -> bool:
    try:
        ast.parse(code_str)
        return True
    except SyntaxError:
        return False`
    },
    {
      id: 'output-card-schema',
      name: 'AgentForge Structured JSON Card Output Schema',
      category: 'Output Templates',
      baseScore: 93.5,
      dim: '1536-dim vector',
      hash: '0x4e5f6a7b',
      keywords: ['json', 'output', 'schema', 'card', 'template'],
      snippet: `{
  "type": "general",
  "text": "Agent execution result payload",
  "toolCall": "FastMCP.execute_tool()",
  "status": "PASS"
}`
    }
  ];

  const itemsToRender = liveVectors || rawVectorDB;
  
  const filteredItems = itemsToRender.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery = !searchQuery.trim() || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="section-container" id="rag-kb">
      <div className="section-header text-center">
        <div className="section-micro-badge">
          <Database size={12} className={isBackendConnected ? "text-emerald-400" : "text-zinc-400"} />
          <span>{isBackendConnected ? "ChromaDB Vector Store • Live Backend Active" : "ChromaDB RAG Indexing"}</span>
        </div>
        <h2 className="section-title">RAG Knowledge Engine</h2>
        <p className="section-subtitle">
          AgentForge queries a 1536-dimensional vector store of verified Google ADK & FastMCP patterns to guarantee valid, production-grade code.
        </p>
      </div>

      <div className="rag-explorer-wrapper glass-card">
        
        <div className="rag-control-bar">
          <div className="rag-search-box">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ChromaDB vector index..."
              className="rag-search-input"
              autoComplete="off"
            />
          </div>

          <div className="rag-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rag-results-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="vector-card compact-vector-item"
              onClick={() => setSelectedItem(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="vector-card-header" style={{ width: '100%' }}>
                <div className="vector-title-group">
                  <Code2 size={16} className="text-zinc-300 flex-shrink-0" />
                  <span className="vector-name">{item.name}</span>
                </div>
                
                <div className="vector-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                  <span className="meta-badge" style={{ fontSize: '0.685rem' }}>
                    <Layers size={10} /> {item.category}
                  </span>
                  <span className="meta-badge mono" style={{ fontSize: '0.685rem', color: '#60a5fa' }}>
                    <ExternalLink size={10} /> View
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div 
          className="rag-modal-overlay" 
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            className="rag-modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'rgba(11, 16, 27, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 229, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>{selectedItem.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className="meta-badge" style={{ fontSize: '0.7rem' }}><Layers size={10} /> {selectedItem.category}</span>
                    <span className="meta-badge" style={{ fontSize: '0.7rem' }}><Cpu size={10} /> {selectedItem.dim}</span>
                    <span className="meta-badge mono" style={{ fontSize: '0.7rem' }}>{selectedItem.hash}</span>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#a1a1aa',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {selectedItem.matchScore ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Cosine Vector Similarity:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{selectedItem.matchScore}% Match</span>
                </div>
                <div className="similarity-bar-bg">
                  <div className="similarity-bar-fill" style={{ width: `${selectedItem.matchScore}%` }} />
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'JetBrains Mono, monospace' }}>
                Python Code Pattern Snippet:
              </span>

              <button 
                type="button"
                onClick={() => handleCopyCode(selectedItem.snippet)}
                style={{
                  background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: copied ? '#34d399' : '#f4f4f5',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div style={{ background: '#05080e', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', maxHeight: '280px', overflowY: 'auto' }}>
              <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#93c5fd', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <code>{selectedItem.snippet}</code>
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#ffffff',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
