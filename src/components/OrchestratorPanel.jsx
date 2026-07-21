import React from 'react';
import { Network, RotateCcw, Loader2, CheckCircle2, Clock } from 'lucide-react';

export default function OrchestratorPanel({ activeStep, logs, elapsedTime, onReset }) {
  const steps = [
    { id: 1, title: "Requirement Analyzer", desc: "Extracting tools, APIs & triggers..." },
    { id: 2, title: "Architecture Designer", desc: "Mapping ADK agents & FastMCP tools..." },
    { id: 3, title: "Code Generator (RAG)", desc: "Querying ChromaDB & writing agent.py..." },
    { id: 4, title: "Validator & Runner", desc: "AST syntax check & subprocess test..." }
  ];

  return (
    <div className="orchestrator-panel glass-card">
      <div className="panel-header">
        <div className="panel-title">
          <span className="pulse-ring" />
          <Network size={18} />
          <span>ADK Orchestrator Pipeline</span>
        </div>
        <div className="panel-controls">
          <span className="timer-badge">{(elapsedTime / 1000).toFixed(1)}s</span>
          <button className="btn-small glass-btn" onClick={onReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Pipeline Stepper */}
      <div className="pipeline-stepper">
        {steps.map((st) => {
          let statusClass = "pending";
          if (st.id === activeStep) statusClass = "active";
          if (st.id < activeStep || activeStep === 5) statusClass = "completed";

          return (
            <div key={st.id} className={`step-card ${statusClass}`}>
              <div className="step-number">{st.id}</div>
              <div className="step-info">
                <h4>{st.title}</h4>
                <p className="step-desc">{st.desc}</p>
              </div>
              <div className="step-status">
                {statusClass === "active" && <Loader2 size={16} className="fa-spin" />}
                {statusClass === "completed" && <CheckCircle2 size={16} />}
                {statusClass === "pending" && <Clock size={16} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reasoning Log Stream */}
      <div className="log-stream-box">
        {logs.map((log, index) => (
          <div key={index} className={`log-line ${log.type}`}>
            <span className="timestamp">[{log.time}]</span>
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}
