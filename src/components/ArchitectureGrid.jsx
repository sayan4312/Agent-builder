import React, { useState } from 'react';
import { Brain, Compass, Code, ShieldCheck, CheckCircle } from 'lucide-react';

export default function ArchitectureGrid() {
  const [activeTab, setActiveTab] = useState(0);

  const pipeline = [
    {
      step: "01",
      icon: <Brain size={20} />,
      title: "Requirement Analyzer",
      badge: "Gemini 2.0 Flash (JSON Mode)",
      desc: "Decomposes natural language prompts into structured JSON schema extracting tool definitions, trigger rules, and parameter types.",
      details: [
        "AST prompt parser extracts tool names & parameters",
        "Identifies cron schedules or threshold conditions",
        "Generates strict JSON schema for downstream agents"
      ],
      sampleOutput: `{
  "agent_name": "crypto_price_sentinel",
  "tools": ["get_crypto_price", "send_alert"],
  "trigger": "threshold > 100000 USD",
  "model": "gemini-2.0-flash"
}`
    },
    {
      step: "02",
      icon: <Compass size={20} />,
      title: "Architecture Designer",
      badge: "Google ADK Blueprint",
      desc: "Synthesizes multi-agent topologies and FastMCP server blueprints with stdio & HTTP transport layer routing.",
      details: [
        "Maps required capabilities to Google ADK LlmAgent instances",
        "Configures FastMCP tool server topology",
        "Defines standard I/O channels & environment dependencies"
      ],
      sampleOutput: `topology:
  framework: "Google ADK v2.0"
  mcp_server: "FastMCP Stdio"
  agents:
    - name: "PriceTracker"
      tools: ["CryptoTools.get_btc_price"]`
    },
    {
      step: "03",
      icon: <Code size={20} />,
      title: "Code Generator (RAG)",
      badge: "ChromaDB + Gemini RAG",
      desc: "Queries ChromaDB vector store for 1536-dim embedding matches of Google ADK templates and generates complete Python source code.",
      details: [
        "Vector search retrieves top 3 similarity template snippets",
        "Generates production agent.py, tools_server.py & requirements.txt",
        "Injects error handling and async execution loops"
      ],
      sampleOutput: `from google.genai.adk import LlmAgent
from fastmcp import FastMCP

mcp = FastMCP("CryptoTools")
@mcp.tool()
def get_btc_price() -> float:
    return 102450.0`
    },
    {
      step: "04",
      icon: <ShieldCheck size={20} />,
      title: "Validator & Execution Engine",
      badge: "Python AST & Subprocess",
      desc: "Executes Python AST syntax parsing and isolated subprocess dry runs to guarantee zero-error executable output.",
      details: [
        "AST parse verifies 0 syntax errors or missing imports",
        "Isolated sandbox test execution with 5s timeout",
        "Returns verified, executable agent zip bundle"
      ],
      sampleOutput: `[AST Validator] Parsing agent.py... PASS ✅
[AST Validator] Parsing tools_server.py... PASS ✅
[Subprocess] Test run exit code: 0 (Execution Success)`
    }
  ];

  return (
    <section className="section-container" id="architecture">
      <div className="section-header text-center">
        <div className="section-micro-badge">
          <Brain size={12} className="text-zinc-400" />
          <span>Sequential Agentic Workflow</span>
        </div>
        <h2 className="section-title">The 4-Agent Pipeline</h2>
        <p className="section-subtitle">
          How AgentForge transforms simple ideas into production-ready Google ADK & FastMCP agent code.
        </p>
      </div>

      {/* Pipeline Navigation Flow */}
      <div className="pipeline-flow-wrapper">
        <div className="pipeline-steps-grid">
          {pipeline.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`pipeline-step-card ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              <div className="step-card-top">
                <span className="step-number">{item.step}</span>
                <div className="step-icon">{item.icon}</div>
              </div>
              <h3 className="step-title">{item.title}</h3>
              <span className="step-badge">{item.badge}</span>
            </button>
          ))}
        </div>

        {/* Selected Step Detail Inspector */}
        <div className="pipeline-inspector-box glass-card">
          <div className="inspector-left">
            <div className="inspector-header">
              <span className="inspector-step-tag">Phase {pipeline[activeTab].step}</span>
              <h3>{pipeline[activeTab].title}</h3>
            </div>
            
            <p className="inspector-desc">{pipeline[activeTab].desc}</p>

            <ul className="inspector-details-list">
              {pipeline[activeTab].details.map((dt, dIdx) => (
                <li key={dIdx}>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span>{dt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="inspector-right">
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="term-dot red" />
                <span className="term-dot yellow" />
                <span className="term-dot green" />
                <span className="term-title">output_blueprint.json</span>
              </div>
              <pre className="terminal-code">
                <code>{pipeline[activeTab].sampleOutput}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
