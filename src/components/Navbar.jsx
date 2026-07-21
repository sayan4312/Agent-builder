import React, { useState, useEffect } from 'react';
import { Flame, Github, GitBranch, Layers, Cpu, BookOpen, ChevronUp } from 'lucide-react';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sections = [
    { id: 'hero', label: 'Pipeline', icon: GitBranch, href: '#hero' },
    { id: 'architecture', label: 'Architecture', icon: Layers, href: '#architecture' },
    { id: 'mcp-docs', label: 'MCP Servers', icon: Cpu, href: '#mcp-docs' },
    { id: 'rag-kb', label: 'RAG Docs', icon: BookOpen, href: '#rag-kb' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button
      setShowScrollTop(window.scrollY > 300);

      // Detect active section
      const sectionElements = sections.map(s => document.getElementById(s.id)).filter(Boolean);
      
      let currentActive = 'hero';
      for (let element of sectionElements) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150) {
          currentActive = element.id;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const elementId = href.replace('#', '');
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar glass-card">
      <div className="nav-brand" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
        <div className="brand-logo-icon">
          <Flame size={18} color="#ffffff" />
        </div>
        <span className="brand-name">
          Agent<span className="highlight">Forge</span>
        </span>
      </div>

      <nav className="nav-links">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.href)}
              className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Icon size={15} /> {section.label}
            </button>
          );
        })}
      </nav>

      <div className="nav-actions">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="btn-secondary glass-btn"
            title="Scroll to top"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ChevronUp size={15} /> Top
          </button>
        )}
        <a 
          href="https://github.com/google/agentforge" 
          target="_blank" 
          rel="noreferrer" 
          className="btn-secondary glass-btn"
        >
          <Github size={15} /> GitHub
        </a>
      </div>
    </header>
  );
}
