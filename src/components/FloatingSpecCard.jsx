import React from 'react';
import { Cpu, Check } from 'lucide-react';

export default function FloatingSpecCard() {
  return (
    <div className="floating-spec-card glass-card animate-fade-in delay-3">
      <div className="spec-card-header">
        <Cpu size={18} />
        <span>AgentForge Stack Specs</span>
      </div>
      <ul className="spec-list">
        <li><Check size={16} /> <strong>LLM:</strong> Gemini 2.0 Flash (AI Studio)</li>
        <li><Check size={16} /> <strong>Framework:</strong> Google ADK (Python)</li>
        <li><Check size={16} /> <strong>Tool Protocol:</strong> 3 FastMCP Servers</li>
        <li><Check size={16} /> <strong>RAG Store:</strong> ChromaDB + text-embedding-004</li>
        <li><Check size={16} /> <strong>Validation:</strong> Subprocess AST + Execution</li>
      </ul>
    </div>
  );
}
