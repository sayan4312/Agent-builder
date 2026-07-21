import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/mockData';

export default function GlassForgeBar({ prompt, setPrompt, onForge, isBuilding }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onForge(prompt);
    }
  };

  const handleChipClick = (scenarioPrompt) => {
    setPrompt(scenarioPrompt);
    onForge(scenarioPrompt);
  };

  return (
    <div className="forge-bar-wrapper animate-slide-up delay-2">
      <form onSubmit={handleSubmit} className="glass-forge-bar">
        <div className="forge-input-icon">
          <Search size={16} />
        </div>
        
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="forge-input" 
          placeholder="What agent would you like to build?" 
          disabled={isBuilding}
          autoComplete="off"
        />

        <button 
          type="submit" 
          className="forge-submit-btn" 
          disabled={isBuilding || !prompt.trim()}
        >
          <span>{isBuilding ? "Building..." : "Build Agent"}</span>
          <ArrowRight size={15} />
        </button>
      </form>

      {/* Preset Chips */}
      <div className="prompt-chips-container">
        <span className="chips-label">Try Scenarios:</span>
        {DEMO_SCENARIOS.slice(0, 3).map((sc) => (
          <button 
            key={sc.id}
            type="button"
            className="chip-btn"
            onClick={() => handleChipClick(sc.prompt)}
          >
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
