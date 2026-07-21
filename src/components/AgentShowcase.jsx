import React from 'react';
import { Bot, ArrowUpRight, Zap, Terminal, ShieldCheck, Trash2 } from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/mockData';

export default function AgentShowcase({ agents, onSelectScenario, onClearCache }) {
  const showcaseAgents = agents || [
    {
      id: 'btc-tracker',
      title: 'Crypto Price Sentinel',
      status: 'ACTIVE',
      tag: 'ADK + FastMCP',
      desc: 'Monitors BTC price via real-time API, evaluates > $100K thresholds, and triggers automated alerts.',
      tools: ['get_crypto_price', 'send_alert'],
      latency: '1.2s',
      accuracy: '100% AST Pass'
    },
    {
      id: 'delhi-weather',
      title: 'Delhi Weather & Outfit Advisor',
      status: 'READY',
      tag: 'Weather API + ADK',
      desc: 'Fetches current Delhi temperature and humidity, then recommends appropriate attire and umbrellas.',
      tools: ['get_city_weather', 'recommend_outfit'],
      latency: '0.9s',
      accuracy: '100% AST Pass'
    },
    {
      id: 'hn-summarizer',
      title: 'Hacker News Digest Agent',
      status: 'ACTIVE',
      tag: 'Scraper + RAG',
      desc: 'Scrapes top 3 stories from Hacker News frontpage, summarizes key technical points, and outputs JSON.',
      tools: ['fetch_hn_stories', 'summarize_nlp'],
      latency: '1.8s',
      accuracy: '100% AST Pass'
    }
  ];

  return (
    <section className="section-container" id="agents">
      <div className="section-header text-center">
        <div className="section-micro-badge">
          <Bot size={12} className="text-zinc-400" />
          <span>Pre-Built & User-Forged Agents ({showcaseAgents.length}/3 Cache)</span>
        </div>
        <h2 className="section-title">Ready-to-Deploy Agents</h2>
        <p className="section-subtitle">
          Explore production AI agents forged by AgentForge, complete with FastMCP tools and Google ADK execution loops.
        </p>
        {showcaseAgents.length > 0 && (
          <button 
            type="button"
            onClick={onClearCache}
            className="btn-small glass-btn"
            style={{ marginTop: '1rem', opacity: 0.7 }}
          >
            <Trash2 size={14} /> Clear Cache
          </button>
        )}
      </div>

      <div className="agent-showcase-grid">
        {showcaseAgents.map((agent) => (
          <div key={agent.id} className="agent-showcase-card glass-card">
            <div className="showcase-card-top">
              <div className="showcase-icon-box">
                <Bot size={20} className="text-white" />
              </div>
              <span className={`status-pill-badge ${agent.status ? agent.status.toLowerCase() : 'active'}`}>
                <span className="dot" /> {agent.status || 'ACTIVE'}
              </span>
            </div>

            <h3 className="showcase-title">{agent.title}</h3>
            <p className="showcase-desc">{agent.desc}</p>

            {/* FastMCP Tools List */}
            <div className="showcase-tools-list">
              <span className="tools-label"><Terminal size={11} /> FastMCP Tools:</span>
              <div className="tools-tags-group">
                {(agent.tools || ['custom_tool_api']).map((t, idx) => (
                  <span key={idx} className="tool-chip">{t}</span>
                ))}
              </div>
            </div>

            <div className="showcase-stats-row">
              <span className="stat-pill"><Zap size={12} /> {agent.latency || '1.0s'} Synthesis</span>
              <span className="stat-pill"><ShieldCheck size={12} /> {agent.accuracy || '100% AST Pass'}</span>
            </div>

            <button 
              type="button" 
              className="showcase-action-btn"
              onClick={() => {
                const scenarioPrompt = agent.prompt || (DEMO_SCENARIOS.find(s => s.id === agent.id)?.prompt) || agent.title;
                const cleanName = agent.title ? agent.title.replace(/[^a-zA-Z0-9]/g, '') : 'CustomAgent';
                
                const agentFiles = agent.files || {
                  agentPy: `# agent.py - Pre-Built Agent: ${agent.title}
import os
import requests
from google import genai

class ${cleanName}Agent:
    def __init__(self, prompt="${scenarioPrompt}"):
        self.prompt = prompt
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

    def run(self):
        print(f"🤖 [EXECUTING PRE-BUILT AGENT] Task: {self.prompt}")
        res = requests.get("https://httpbin.org/get", timeout=5).json()
        return f"Successfully executed workflow for: {self.prompt}"

if __name__ == "__main__":
    agent = ${cleanName}Agent()
    print(agent.run())
`,
                  mcpPy: `# tools_server.py - FastMCP Tool Server for: ${agent.title}
from fastmcp import FastMCP

mcp = FastMCP("${cleanName}Tools")

@mcp.tool()
def execute_agent_tool() -> str:
    """Executes tool payload for ${agent.title}."""
    return "TOOL_EXECUTION_SUCCESS"

if __name__ == "__main__":
    mcp.run(transport="stdio")
`,
                  reqTxt: `google-genai>=0.1.1\nfastmcp>=0.1.0\nrequests>=2.31.0\n`,
                  output: `[00:00:01] AST Syntax Check PASS ✅\n[00:00:02] Connected to FastMCP server stdio transport.\n[00:00:03] Loaded ready-to-deploy agent: "${agent.title}"`,
                  prompt: scenarioPrompt
                };

                if (onSelectScenario) {
                  onSelectScenario(scenarioPrompt, agentFiles);
                }
              }}
            >
              <span>Launch & View Code</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
