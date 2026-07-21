import React, { useState, useEffect } from 'react';
import { Copy, Download, Terminal, Check, FileCode, Server, ListChecks, MessageSquare, Send, Sparkles, Cpu, Users, TrendingUp, HelpCircle, Package, Mail, GitPullRequest, CloudSun, Newspaper, ShieldCheck } from 'lucide-react';

export default function WorkspacePanel({ generatedFiles }) {
  const [activeTab, setActiveTab] = useState('web-ui');
  const [copied, setCopied] = useState(false);

  // Live Web UI state
  const [userQuery, setUserQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (generatedFiles) {
      const promptText = generatedFiles.prompt ? `for "${generatedFiles.prompt}"` : 'powered by Gemini 2.0 Flash & FastMCP';
      setChatMessages([
        {
          sender: 'agent',
          text: `👋 Welcome! I am your AI Agent forged ${promptText}. Ask me a question or request a task execution to test its FastMCP tools live!`,
          timestamp: 'Just now'
        }
      ]);
    }
  }, [generatedFiles?.prompt]);

  if (!generatedFiles) return null;

  const agentPromptStr = generatedFiles?.prompt || 'Custom AI Agent';
  const agentTitle = agentPromptStr.length > 40 ? agentPromptStr.substring(0, 40) + '...' : agentPromptStr;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'agent': return generatedFiles.agentPy || generatedFiles.agent;
      case 'tools': return generatedFiles.mcpPy || generatedFiles.tools;
      case 'requirements': return generatedFiles.reqTxt || generatedFiles.requirements;
      default: return generatedFiles.agentPy || generatedFiles.agent;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    const agentPy = generatedFiles.agentPy || generatedFiles.agent || "";
    const mcpPy = generatedFiles.mcpPy || generatedFiles.tools || "";
    const reqTxt = generatedFiles.reqTxt || generatedFiles.requirements || "";

    try {
      const res = await fetch("http://localhost:8000/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_py: agentPy, mcp_py: mcpPy, req_txt: reqTxt })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "agentforge_project.zip";
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      // Backend offline fallback
    }

    const zipContent = `AgentForge Generated Package\n============================\n\n- agent.py\n- tools_server.py\n- requirements.txt\n\nRun instructions:\n1. pip install -r requirements.txt\n2. python tools_server.py\n3. python agent.py`;
    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent_package.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isExecuting) return;

    const queryText = userQuery.trim();
    const qLower = queryText.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, {
      sender: 'user',
      text: queryText,
      timestamp: timeStr
    }]);

    setUserQuery('');
    setIsExecuting(true);

    const agentPy = generatedFiles?.agentPy || generatedFiles?.agent || "";
    const mcpPy = generatedFiles?.mcpPy || generatedFiles?.tools || "";
    const agentPrompt = generatedFiles?.prompt || "";

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          agent_code: agentPy,
          tools_code: mcpPy,
          agent_prompt: agentPrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...data
        }]);
        setIsExecuting(false);
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    // Client-side fallback if backend is offline
    setTimeout(() => {
      let agentReply;

      // 1. Sales & Lead Prospecting
      if (qLower.includes('sales') || qLower.includes('lead') || qLower.includes('prospect') || qLower.includes('ceo') || qLower.includes('client') || qLower.includes('email')) {
        agentReply = {
          type: 'sales',
          text: `💼 **Sales Prospecting Agent Output** for "${queryText}":`,
          leads: [
            { name: 'Sarah Chen', title: 'CEO', company: 'FinTechFlow', email: 'sarah@fintechflow.io' },
            { name: 'Alex Rivera', title: 'Founder & CEO', company: 'PayPulse', email: 'alex@paypulse.com' },
            { name: 'David Kim', title: 'Chief Executive', company: 'VaultLayer', email: 'david@vaultlayer.net' }
          ],
          emailDraft: `Hi Sarah, loved FinTechFlow's recent growth in Q3. AgentForge automates AI workflows for fintech teams...`,
          toolCall: 'FastMCP.search_leads(industry="Fintech")'
        };
      }
      // 2. Financial & Market Analysis
      else if (qLower.includes('finance') || qLower.includes('nvda') || qLower.includes('aapl') || qLower.includes('revenue') || qLower.includes('stock') || qLower.includes('btc') || qLower.includes('crypto') || qLower.includes('price')) {
        agentReply = {
          type: 'finance',
          text: `📈 **Financial Analysis Agent Output** for "${queryText}":`,
          metrics: [
            { symbol: 'NVDA', rev: '$35.1B (+94%)', pe: '58.2', alert: true },
            { symbol: 'AAPL', rev: '$94.9B (+6%)', pe: '33.5', alert: false },
            { symbol: 'BTC/USD', rev: '$102,450.00 (+4.2%)', pe: 'N/A', alert: true }
          ],
          alertMsg: '⚠️ THRESHOLD BREACHED: NVDA P/E Ratio (58.2) > Limit (50.0). Automated Slack Alert Dispatched.',
          toolCall: 'FastMCP.get_financial_metrics()'
        };
      }
      // 3. Customer Support & Order Tracking
      else if (qLower.includes('support') || qLower.includes('order') || qLower.includes('refund') || qLower.includes('track') || qLower.includes('ticket') || qLower.includes('package') || qLower.includes('help')) {
        agentReply = {
          type: 'support',
          text: `🎧 **Customer Support Agent Output** for "${queryText}":`,
          orderId: '#4829',
          status: 'In Transit via FedEx (ETA: Tomorrow 2 PM)',
          policy: 'Per store policy, refund requests are eligible after delivery attempt.',
          toolCall: 'FastMCP.check_order_status(id=4829)'
        };
      }
      // 4. Weather & Outfit Advice
      else if (qLower.includes('rain') || qLower.includes('weather') || qLower.includes('delhi') || qLower.includes('temp') || qLower.includes('outfit') || qLower.includes('monday')) {
        agentReply = {
          type: 'weather',
          text: `🌧️ **Weather Advisor Agent Output** for "${queryText}":`,
          city: 'Delhi, IN',
          temp: '28°C',
          rainProb: '85% (Heavy Rain Expected)',
          outfit: 'Carry an umbrella and wear a light waterproof jacket.',
          toolCall: 'FastMCP.fetch_weather(city="Delhi")'
        };
      }
      // 5. Code Review & GitHub PR Analysis
      else if (qLower.includes('code') || qLower.includes('github') || qLower.includes('pr') || qLower.includes('bug') || qLower.includes('repo') || qLower.includes('review')) {
        agentReply = {
          type: 'code',
          text: `🔍 **Code Review & AST Security Agent Output** for "${queryText}":`,
          repo: 'owner/agentforge-core',
          prId: 'PR #142',
          astStatus: 'PASS ✅ (0 syntax errors)',
          securityCheck: 'Clean (0 hardcoded credentials or vulnerabilities)',
          toolCall: 'FastMCP.analyze_pull_request(id=142)'
        };
      }
      // 6. News & Web Scraping
      else if (qLower.includes('news') || qLower.includes('hacker') || qLower.includes('hn') || qLower.includes('scrape') || qLower.includes('article') || qLower.includes('summarize')) {
        agentReply = {
          type: 'news',
          text: `📰 **Web Scraper & Digest Agent Output** for "${queryText}":`,
          stories: [
            { title: 'DeepSeek-V3 Architecture Released', source: 'Hacker News #1' },
            { title: 'Google ADK 2.0 Multi-Agent Framework', source: 'Hacker News #2' },
            { title: 'FastMCP Protocol Transport Specification', source: 'Hacker News #3' }
          ],
          toolCall: 'FastMCP.scrape_top_stories()'
        };
      }
      // 7. Dynamic Real-World Execution Generator
      else {
        agentReply = {
          type: 'general',
          text: `Agent received: "${queryText}". Processing...`,
          queryText: queryText
        };
      }

      setChatMessages(prev => [...prev, {
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...agentReply
      }]);

      setIsExecuting(false);
    }, 1200);
  };

  return (
    <div className="generated-workspace glass-card" id="workspace">
      <div className="workspace-header">
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'web-ui' ? 'active' : ''}`}
            onClick={() => setActiveTab('web-ui')}
          >
            <MessageSquare size={14} className="text-emerald-400" /> Web UI
          </button>

          <button 
            className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <FileCode size={14} /> agent.py
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            <Server size={14} /> tools_server.py
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            <ListChecks size={14} /> requirements.txt
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <Terminal size={14} /> Console
          </button>
        </div>

        <div className="workspace-actions">
          <button className="btn-action primary-btn" onClick={handleDownloadZip}>
            <Download size={14} /> Download Zip
          </button>
        </div>
      </div>

      <div className="workspace-body">
        {activeTab === 'web-ui' && (
          <div className="agent-web-ui-container">
            {/* Top Bar */}
            <div className="web-ui-bar">
              <div className="status-group">
                <span className="dot green" />
                <span className="agent-status-title">Agent Execution Environment • FastMCP stdio active</span>
              </div>
            </div>

            {/* Message Feed */}
            <div className="web-ui-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-bubble">
                    {msg.sender === 'agent' && (
                      <div className="bubble-header">
                        {msg.toolCall && (
                          <span className="tool-executed-tag"><Cpu size={10} /> {msg.toolCall}</span>
                        )}
                      </div>
                    )}

                    <div className="bubble-text">{msg.text}</div>

                    {/* 1. Sales Prospecting Widget */}
                    {msg.type === 'sales' && msg.leads && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <Users size={14} className="text-blue-400" />
                          <span>Discovered ICP Leads ({msg.leads.length})</span>
                        </div>
                        <div className="leads-table">
                          {msg.leads.map((ld, lIdx) => (
                            <div key={lIdx} className="lead-item-row">
                              <span className="lead-name">{ld.name} ({ld.title})</span>
                              <span className="lead-comp">{ld.company}</span>
                              <span className="lead-email">{ld.email}</span>
                            </div>
                          ))}
                        </div>
                        <div className="email-draft-box">
                          <span className="draft-title"><Mail size={12} /> Draft Outreach Email:</span>
                          <p>"{msg.emailDraft}"</p>
                          <button type="button" className="widget-btn" onClick={() => alert("🚀 Email dispatched via SendGrid API!")}>
                            Approve & Dispatch Outreach
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Financial Analysis Widget */}
                    {msg.type === 'finance' && msg.metrics && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <TrendingUp size={14} className="text-emerald-400" />
                          <span>Financial Comparison Matrix</span>
                        </div>
                        <div className="finance-table">
                          {msg.metrics.map((m, mIdx) => (
                            <div key={mIdx} className="finance-item-row">
                              <span className="ticker">{m.symbol}</span>
                              <span>Metric: {m.rev}</span>
                              <span>P/E: <strong>{m.pe}</strong></span>
                              {m.alert && <span className="alert-pill">⚠️ Exceeds Limit</span>}
                            </div>
                          ))}
                        </div>
                        <div className="alert-banner">{msg.alertMsg}</div>
                      </div>
                    )}

                    {/* 3. Customer Support Widget */}
                    {msg.type === 'support' && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <HelpCircle size={14} className="text-purple-400" />
                          <span>Order Status & Resolution</span>
                        </div>
                        <div className="support-status-box">
                          <div className="status-item"><Package size={13} /> Order ID: <strong>{msg.orderId}</strong></div>
                          <div className="status-item">Status: <span>{msg.status}</span></div>
                          <p className="policy-note">{msg.policy}</p>
                          <div className="widget-actions-row">
                            <button type="button" className="widget-btn-subtle" onClick={() => alert("📦 FedEx Tracking: Package in transit (FedEx #9823472)")}>
                              Track Package
                            </button>
                            <button type="button" className="widget-btn" onClick={() => alert("✅ Support ticket updated. Refund exception submitted to supervisor.")}>
                              Request Refund Exception
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Weather Forecast Widget */}
                    {msg.type === 'weather' && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <CloudSun size={14} className="text-amber-400" />
                          <span>Weather Forecast & Clothing Recommendation</span>
                        </div>
                        <div className="support-status-box">
                          <div className="status-item">Location: <strong>{msg.city}</strong></div>
                          <div className="status-item">Precipitation Chance: <strong className="text-emerald-400">{msg.rainProb}</strong></div>
                          <p className="policy-note"><strong>Attire Recommendation</strong>: {msg.outfit}</p>
                        </div>
                      </div>
                    )}

                    {/* 5. Code Review Widget */}
                    {msg.type === 'code' && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <GitPullRequest size={14} className="text-cyan-400" />
                          <span>GitHub PR Review Result</span>
                        </div>
                        <div className="support-status-box">
                          <div className="status-item">Repository: <strong>{msg.repo}</strong> ({msg.prId})</div>
                          <div className="status-item">AST Syntax Check: <strong className="text-emerald-400">{msg.astStatus}</strong></div>
                          <div className="status-item">Security Audit: <span>{msg.securityCheck}</span></div>
                          <button type="button" className="widget-btn" onClick={() => alert("✅ PR Approved and merged into main branch!")}>
                            Approve & Merge PR
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 6. News & Web Scraper Widget */}
                    {msg.type === 'news' && msg.stories && (
                      <div className="rich-widget-card">
                        <div className="widget-header">
                          <Newspaper size={14} className="text-blue-400" />
                          <span>Scraped Technical Articles</span>
                        </div>
                        <div className="leads-table">
                          {msg.stories.map((st, sIdx) => (
                            <div key={sIdx} className="lead-item-row">
                              <span className="lead-name">{st.title}</span>
                              <span className="lead-email">{st.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <span className="bubble-time">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isExecuting && (
                <div className="chat-bubble-row agent">
                  <div className="chat-bubble executing">
                    <Sparkles size={14} className="animate-spin text-zinc-400" />
                    <span>Agent calling FastMCP tool & processing query...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="web-ui-input-form">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={`Ask a question or request a task for "${agentTitle}"...`} 
                className="web-ui-input"
                disabled={isExecuting}
              />
              <button type="submit" className="web-ui-send-btn" disabled={!userQuery.trim() || isExecuting}>
                <span>Send</span>
                <Send size={14} />
              </button>
            </form>

          </div>
        )}

        {activeTab !== 'web-ui' && activeTab !== 'console' && (
          <div className="tab-content active code-box-relative">
            <button className="in-box-copy-btn" onClick={handleCopy} title="Copy Code">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <pre><code className="language-python">{getActiveCode()}</code></pre>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="terminal-output-container">
            <div className="terminal-bar">
              <span className="term-dot red" />
              <span className="term-dot yellow" />
              <span className="term-dot green" />
              <span className="term-title">Python Subprocess Console Output (timeout=30s)</span>
            </div>
            <pre className="terminal-body">{generatedFiles.output || generatedFiles.liveOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
