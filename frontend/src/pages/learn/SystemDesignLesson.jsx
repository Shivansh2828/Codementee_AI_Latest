import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ChevronRight, BookOpen, Lightbulb, AlertTriangle, Info, Menu, X, CheckCircle, XCircle, Code2, Layers, Zap, Lock, Crown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopicBySlug, getNextTopic, getPrevTopic, TOPICS, SECTIONS, getTopicAccess } from '../../data/systemDesignCourse';
import { ANIMATIONS } from '../../components/learn/CourseAnimations';
import { useAuth } from '../../contexts/AuthContext';

// ── Rich text renderer ───────────────────────────────────────────────────────
const RichText = ({ text, theme }) => {
  if (!text) return null;
  // Split on code fences first
  const fenceParts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {fenceParts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, ''); // strip language hint
          return (
            <pre key={i} className={`${theme.bg.secondary} rounded-xl p-4 text-sm text-green-300 font-mono overflow-x-auto my-4 border ${theme.border.primary} leading-relaxed`}>
              {code.trim()}
            </pre>
          );
        }
        // Inline bold, links + newlines
        const lines = part.split('\n');
        return (
          <span key={i}>
            {lines.map((line, li) => {
              // Split on bold (**text**) and links ([text](url))
              const tokens = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
              return (
                <span key={li}>
                  {tokens.map((tok, ti) => {
                    if (tok.startsWith('**') && tok.endsWith('**')) {
                      return <strong key={ti} className={`${theme.text.primary} font-semibold`}>{tok.slice(2, -2)}</strong>;
                    }
                    const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                      const isExternal = linkMatch[2].startsWith('http');
                      return <a key={ti} href={linkMatch[2]} className="text-blue-500 hover:text-blue-400 hover:underline" {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{linkMatch[1]}</a>;
                    }
                    return <span key={ti}>{tok}</span>;
                  })}
                  {li < lines.length - 1 && <br />}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
};

const calloutStyles = {
  tip:     { bg: 'bg-green-500/10 border-green-500/30',  label: '💡 Tip',       labelColor: 'text-green-400' },
  warning: { bg: 'bg-yellow-500/10 border-yellow-500/30', label: '⚠️ Watch Out', labelColor: 'text-yellow-400' },
  info:    { bg: 'bg-blue-500/10 border-blue-500/30',    label: 'ℹ️ Note',      labelColor: 'text-blue-400' },
  example: { bg: 'bg-purple-500/10 border-purple-500/30', label: '📌 Example',   labelColor: 'text-purple-400' },
};

// ── Diagram component (static visual diagrams) ──────────────────────────────
const DiagramSection = ({ section, theme }) => {
  return (
    <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
      {section.heading && (
        <div className={`px-6 py-3 border-b ${theme.border.primary}`}>
          <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
          {section.caption && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.caption}</p>}
        </div>
      )}
      <div className="p-6">
        {section.variant === 'osi-layers' && (
          <div className="flex flex-col items-center gap-1.5 max-w-md mx-auto">
            {[
              { num: 7, name: 'Application Layer', examples: 'HTTP, DNS, WS, gRPC', color: 'bg-blue-400/20 border-blue-400/50 text-blue-300', important: true },
              { num: 6, name: 'Presentation Layer', examples: 'SSL/TLS, Encryption', color: `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}` },
              { num: 5, name: 'Session Layer', examples: 'Session mgmt', color: `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}` },
              { num: 4, name: 'Transport Layer', examples: 'TCP, UDP, QUIC', color: 'bg-green-400/20 border-green-400/50 text-green-300', important: true },
              { num: 3, name: 'Network Layer', examples: 'IP, Routing', color: 'bg-pink-400/20 border-pink-400/50 text-pink-300', important: true },
              { num: 2, name: 'Data Link Layer', examples: 'Ethernet, MAC', color: `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}` },
              { num: 1, name: 'Physical Layer', examples: 'Cables, WiFi, Fiber', color: `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}` },
            ].map((l) => (
              <div key={l.num} className={`w-full border rounded-lg px-4 py-2.5 flex items-center justify-between ${l.color} ${l.important ? 'ring-1 ring-offset-1 ring-offset-transparent' : ''}`}
                style={{ maxWidth: `${280 + (7 - l.num) * 25}px` }}>
                <span className="text-sm font-bold">{l.name} ({l.num})</span>
                <span className="text-xs opacity-70">{l.examples}</span>
              </div>
            ))}
            <div className={`mt-3 text-xs ${theme.text.muted} text-center`}>
              Colored layers are the ones that matter most for system design interviews
            </div>
          </div>
        )}

        {section.variant === 'url-journey' && (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {[
              { step: '1', label: 'Browser', action: 'User types URL', color: 'blue' },
              { step: '2', label: 'DNS', action: 'Resolve domain → IP address', color: 'purple' },
              { step: '3', label: 'TCP', action: '3-way handshake (SYN → SYN-ACK → ACK)', color: 'cyan' },
              { step: '4', label: 'TLS', action: 'Encrypt connection (HTTPS)', color: 'green' },
              { step: '5', label: 'HTTP', action: 'Send GET request with headers', color: 'orange' },
              { step: '6', label: 'Server', action: 'Process request, query DB, build response', color: 'red' },
              { step: '7', label: 'Response', action: '200 OK + HTML/JSON body', color: 'green' },
              { step: '8', label: 'Render', action: 'Parse HTML, fetch CSS/JS/images, paint page', color: 'blue' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-${s.color}-500/20 border border-${s.color}-500/40 flex items-center justify-center shrink-0`}>
                  <span className={`text-xs font-bold text-${s.color}-400`}>{s.step}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold text-${s.color}-400`}>{s.label}</span>
                  <span className={`text-sm ${theme.text.secondary} ml-2`}>{s.action}</span>
                </div>
                {i < 7 && <div className={`text-xs ${theme.text.muted}`}>↓</div>}
              </div>
            ))}
          </div>
        )}

        {section.variant === 'scaling-types' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <div className="text-center mb-3">
                <span className="text-2xl">⬆️</span>
                <h4 className={`font-bold text-orange-400 mt-1`}>Vertical Scaling</h4>
                <p className={`text-xs ${theme.text.muted}`}>Scale Up — Bigger machine</p>
              </div>
              <div className="flex flex-col items-center gap-2 mb-3">
                <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/40 rounded-lg flex items-center justify-center">
                  <span className={`text-xs font-bold text-orange-300`}>64 CPU<br/>512GB</span>
                </div>
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Simple — no code changes</p>
                <p>✅ No distributed complexity</p>
                <p>❌ Hardware limits (ceiling)</p>
                <p>❌ Single point of failure</p>
                <p>❌ Expensive at high end</p>
              </div>
            </div>
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <div className="text-center mb-3">
                <span className="text-2xl">➡️</span>
                <h4 className={`font-bold text-green-400 mt-1`}>Horizontal Scaling</h4>
                <p className={`text-xs ${theme.text.muted}`}>Scale Out — More machines</p>
              </div>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1,2,3,4].map(n => (
                  <div key={n} className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded flex items-center justify-center">
                    <span className={`text-[9px] font-bold text-green-300`}>4CPU</span>
                  </div>
                ))}
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Theoretically unlimited</p>
                <p>✅ No single point of failure</p>
                <p>✅ Cost-effective (commodity HW)</p>
                <p>❌ Requires load balancing</p>
                <p>❌ Distributed system complexity</p>
              </div>
            </div>
          </div>
        )}

        {section.variant === 'lb-algorithms' && (
          <div className="max-w-lg mx-auto">
            <div className="space-y-3">
              {[
                { name: 'Round Robin', desc: 'Requests go to servers in rotation: 1 → 2 → 3 → 1 → 2 → 3', best: 'Stateless services, equal server capacity', visual: '①→②→③→①→②→③' },
                { name: 'Least Connections', desc: 'Route to the server with fewest active connections', best: 'WebSockets, long-lived connections, uneven request durations', visual: '①(2) ②(5) ③(1) → pick ③' },
                { name: 'IP Hash', desc: 'Hash client IP to always route same client to same server', best: 'Session affinity, sticky sessions', visual: 'hash(IP) % N → always same server' },
                { name: 'Weighted Round Robin', desc: 'Servers with more capacity get proportionally more requests', best: 'Mixed hardware (some servers are bigger)', visual: '①①①→②②→③ (3:2:1 ratio)' },
                { name: 'Random', desc: 'Pick a random server for each request', best: 'Surprisingly effective at scale, simple', visual: 'random(1,2,3) each time' },
              ].map((alg, i) => (
                <div key={i} className={`${theme.bg.secondary} rounded-lg p-4 border ${theme.border.primary}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${theme.text.primary}`}>{alg.name}</span>
                    <code className={`text-[10px] font-mono ${theme.text.muted}`}>{alg.visual}</code>
                  </div>
                  <p className={`text-xs ${theme.text.secondary} mb-1`}>{alg.desc}</p>
                  <p className={`text-[10px] text-cyan-400`}>Best for: {alg.best}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Quiz component ───────────────────────────────────────────────────────────
const QuizSection = ({ section, theme }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = section.questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);

  return (
    <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-purple-500/20">
        <h2 className={`text-lg font-bold ${theme.text.primary}`}>📝 {section.heading || 'Test Your Knowledge'}</h2>
        {section.description && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.description}</p>}
      </div>
      <div className="p-6 space-y-6">
        {section.questions.map((q, qIdx) => (
          <div key={qIdx}>
            <p className={`text-sm font-medium ${theme.text.primary} mb-3`}>{qIdx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[qIdx] === optIdx;
                const isCorrect = q.correct === optIdx;
                let optClass = `${theme.bg.secondary} ${theme.border.primary} border`;
                if (showResults && isSelected && isCorrect) optClass = 'bg-green-500/20 border-green-500/40 border';
                else if (showResults && isSelected && !isCorrect) optClass = 'bg-red-500/20 border-red-500/40 border';
                else if (showResults && isCorrect) optClass = 'bg-green-500/10 border-green-500/30 border';
                else if (isSelected) optClass = 'bg-[#06b6d4]/20 border-[#06b6d4]/40 border';

                return (
                  <button key={optIdx} onClick={() => handleSelect(qIdx, optIdx)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${optClass} ${!showResults ? 'cursor-pointer hover:border-[#06b6d4]/50' : 'cursor-default'}`}>
                    <span className={`${theme.text.primary}`}>{opt}</span>
                  </button>
                );
              })}
            </div>
            {showResults && answers[qIdx] !== undefined && answers[qIdx] !== q.correct && q.explanation && (
              <p className={`text-xs ${theme.text.muted} mt-2 pl-4 border-l-2 border-red-500/30`}>{q.explanation}</p>
            )}
            {showResults && answers[qIdx] === q.correct && q.explanation && (
              <p className={`text-xs text-green-400 mt-2 pl-4 border-l-2 border-green-500/30`}>{q.explanation}</p>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
          {!showResults ? (
            <button onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < section.questions.length}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${Object.keys(answers).length >= section.questions.length ? 'bg-purple-500 text-white hover:bg-purple-600' : `${theme.bg.secondary} ${theme.text.muted} cursor-not-allowed`}`}>
              Check Answers
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${score === section.questions.length ? 'text-green-400' : score >= section.questions.length / 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}/{section.questions.length} correct
              </span>
              <button onClick={() => { setAnswers({}); setShowResults(false); }} className={`text-xs ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Section renderer ─────────────────────────────────────────────────────────
const Section = ({ section, theme }) => {
  switch (section.type) {

    case 'text':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className={`${theme.text.secondary} leading-relaxed whitespace-pre-line text-base`}>
            <RichText text={section.body} theme={theme} />
          </div>
        </div>
      );

    case 'requirements':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.functional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400 text-sm">Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.functional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} theme={theme} />
                    </div>
                  ))}
                </div>
                {section.functionalOutOfScope && (
                  <div className={`mt-4 pt-4 border-t ${theme.border.primary}`}>
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.functionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className={`w-3 h-3 mt-0.5 shrink-0 ${theme.text.muted}`} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section.nonFunctional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-400 text-sm">Non-Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.nonFunctional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} theme={theme} />
                    </div>
                  ))}
                </div>
                {section.nonFunctionalOutOfScope && (
                  <div className={`mt-4 pt-4 border-t ${theme.border.primary}`}>
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.nonFunctionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className={`w-3 h-3 mt-0.5 shrink-0 ${theme.text.muted}`} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'api':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-3">
            {section.endpoints.map((ep, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl border ${theme.border.primary} overflow-hidden`}>
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme.border.primary}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                    ep.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    ep.method === 'PUT' || ep.method === 'PATCH' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{ep.method}</span>
                  <code className="text-cyan-300 text-sm font-mono">{ep.path}</code>
                  {ep.label && <span className={`ml-auto text-xs ${theme.text.muted}`}>{ep.label}</span>}
                </div>
                {(ep.request || ep.response) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ep.request && (
                      <div>
                        <p className={`text-xs ${theme.text.muted} mb-2 font-medium uppercase tracking-wider`}>Request</p>
                        <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">{ep.request}</pre>
                      </div>
                    )}
                    {ep.response && (
                      <div>
                        <p className={`text-xs ${theme.text.muted} mb-2 font-medium uppercase tracking-wider`}>Response</p>
                        <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">{ep.response}</pre>
                      </div>
                    )}
                  </div>
                )}
                {ep.note && <p className={`px-4 pb-3 text-xs ${theme.text.muted} italic`}>{ep.note}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'schema':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-4">
            {section.entities.map((entity, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl border ${theme.border.primary} overflow-hidden`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme.border.primary}`}>
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-semibold text-sm font-mono">{entity.name}</span>
                  {entity.note && <span className={`ml-auto text-xs ${theme.text.muted}`}>{entity.note}</span>}
                </div>
                <div className="p-4">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className={`${theme.text.muted} border-b ${theme.border.primary}`}>
                        <th className="text-left pb-2 pr-4">Field</th>
                        <th className="text-left pb-2 pr-4">Type</th>
                        <th className="text-left pb-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.fields.map((field, fi) => (
                        <tr key={fi} className={`border-b ${theme.border.primary}`}>
                          <td className="py-1.5 pr-4 text-cyan-300">{field.name}</td>
                          <td className="py-1.5 pr-4 text-yellow-300">{field.type}</td>
                          <td className={`py-1.5 ${theme.text.muted}`}>{field.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'deepdive':
      return (
        <div className="mb-8">
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
            <div className={`px-6 py-4 bg-gradient-to-r from-[#06b6d4]/10 to-transparent border-b ${theme.border.primary}`}>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#06b6d4]" />
                <h2 className={`text-lg font-bold ${theme.text.primary}`}>{section.heading}</h2>
              </div>
              {section.subtitle && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.subtitle}</p>}
            </div>
            <div className="p-6 space-y-6">
              {section.content.map((sub, i) => (
                <Section key={i} section={sub} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'levels':
      const levelColors = { 'Mid-level': 'blue', 'Senior': 'purple', 'Staff+': 'orange' };
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="space-y-4">
            {section.levels.map((level, i) => {
              const color = levelColors[level.title] || 'cyan';
              return (
                <div key={i} className={`${theme.bg.card} border border-${color}-500/20 rounded-xl p-5`}>
                  <h3 className={`font-bold text-${color}-400 mb-3`}>{level.title}</h3>
                  <div className={`${theme.text.secondary} text-sm leading-relaxed whitespace-pre-line`}>
                    <RichText text={level.body} theme={theme} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'animation':
      const AnimComponent = ANIMATIONS[section.id];
      return (
        <div className={`mb-8 rounded-2xl ${theme.bg.card} ${theme.border.primary} border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${theme.border.primary}`}>
            <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
            {section.body && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.body}</p>}
          </div>
          <div className={`p-6 ${theme.bg.secondary}`}>
            {AnimComponent ? <AnimComponent /> : <div className={`text-center ${theme.text.muted} py-8`}>Animation loading...</div>}
          </div>
        </div>
      );

    case 'callout':
      const style = calloutStyles[section.variant] || calloutStyles.info;
      return (
        <div className={`mb-8 p-5 rounded-xl border ${style.bg}`}>
          <p className={`font-semibold mb-2 ${style.labelColor}`}>{style.label}: {section.heading}</p>
          <div className={`${theme.text.secondary} text-sm leading-relaxed`}>
            <RichText text={section.body} theme={theme} />
          </div>
        </div>
      );

    case 'quiz':
      return <QuizSection section={section} theme={theme} />;

    case 'diagram':
      return <DiagramSection section={section} theme={theme} />;

    default:
      return null;
  }
};

const SystemDesignLesson = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic = getTopicBySlug(slug);
  const next = getNextTopic(slug);
  const prev = getPrevTopic(slug);
  const allSlugs = SECTIONS.flatMap(s => s.topics);
  const currentIndex = allSlugs.indexOf(slug);
  const access = getTopicAccess(slug, user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!topic) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${theme.text.primary} text-xl mb-4`}>Lesson not found</p>
          <Link to="/learn/system-design" className="text-[#06b6d4] hover:underline">← Back to course</Link>
        </div>
      </div>
    );
  }

  // Locked — show upgrade prompt
  if (access === 'locked') {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>{topic.title}</h1>
            <p className={`${theme.text.secondary} mb-6`}>
              This lesson requires a paid plan. Upgrade to unlock all system design content.
            </p>
            <div className="space-y-3">
              <Link
                to="/apply"
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-center"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Get Elite — Full Access
              </Link>
              <Link
                to="/apply"
                className={`block w-full px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium text-center hover:border-blue-500/50 transition-all`}
              >
                Get Pro — Partial Access
              </Link>
              <Link
                to="/learn/system-design"
                className={`block text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mt-4`}
              >
                ← Back to course
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <div className="pt-20 flex">

        {/* Sidebar — desktop */}
        <aside className={`hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r ${theme.border.primary} ${theme.bg.card}`}>
          <div className={`p-4 border-b ${theme.border.primary}`}>
            <Link to="/learn/system-design" className={`flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" />
              System Design
            </Link>
          </div>
          <nav className="p-3 space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} flex items-center gap-1.5`}>
                  <span>{section.title}</span>
                </div>
                {section.topics.map((topicSlug) => {
                  const t = TOPICS[topicSlug];
                  if (!t) return null;
                  const topicAccess = getTopicAccess(topicSlug, user);
                  const isTopicLocked = topicAccess === 'locked';
                  if (isTopicLocked) {
                    return (
                      <div key={topicSlug} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.muted} cursor-not-allowed`}>
                        
                        <span className="truncate">{t.title}</span>
                        <Lock className="w-3 h-3 ml-auto shrink-0" />
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={topicSlug}
                      to={`/learn/system-design/${topicSlug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        topicSlug === slug
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium'
                          : `${theme.text.secondary} ${theme.bg.hover}`
                      }`}
                    >
                      
                      <span className="truncate">{t.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className={`w-72 ${theme.bg.card} border-r ${theme.border.primary} flex flex-col overflow-y-auto`}>
              <div className={`p-4 border-b ${theme.border.primary} flex items-center justify-between`}>
                <Link to="/learn/system-design" className={`text-sm ${theme.text.muted}`}>System Design</Link>
                <button onClick={() => setSidebarOpen(false)}><X className={`w-5 h-5 ${theme.text.secondary}`} /></button>
              </div>
              <nav className="p-3 space-y-4">
                {SECTIONS.map((section) => (
                  <div key={section.id}>
                    <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} flex items-center gap-1.5`}>
                      <span>{section.title}</span>
                    </div>
                    {section.topics.map((topicSlug) => {
                      const t = TOPICS[topicSlug];
                      if (!t) return null;
                      const topicAccess = getTopicAccess(topicSlug, user);
                      if (topicAccess === 'locked') {
                        return (
                          <div key={topicSlug} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.muted} cursor-not-allowed`}>
                            
                            <span className="truncate">{t.title}</span>
                            <Lock className="w-3 h-3 ml-auto shrink-0" />
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={topicSlug}
                          to={`/learn/system-design/${topicSlug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            topicSlug === slug ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium' : `${theme.text.secondary} ${theme.bg.hover}`
                          }`}
                        >
                          
                          <span className="truncate">{t.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-10">

            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-lg ${theme.bg.card} border ${theme.border.primary}`}>
                <Menu className={`w-5 h-5 ${theme.text.secondary}`} />
              </button>
              <div className={`text-sm ${theme.text.muted}`}>
                {currentIndex + 1} / {allSlugs.length}
              </div>
            </div>

            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-sm ${theme.text.muted} mb-6`}>
              <Link to="/learn/system-design" className="hover:text-[#06b6d4] transition-colors">System Design</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#06b6d4]">{topic.title}</span>
            </div>

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl"></span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    topic.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{topic.difficulty}</span>
                  <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                    <Clock className="w-3.5 h-3.5" />{topic.duration}
                  </span>
                </div>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-2`}>{topic.title}</h1>
              <p className={`text-lg ${theme.text.secondary}`}>{topic.subtitle}</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-[#06b6d4]/50 to-transparent mb-10" />

            {/* Sections */}
            {topic.sections.map((section, i) => (
              <Section key={i} section={section} theme={theme} />
            ))}

            {/* Preview upgrade banner */}
            {access === 'preview' && (
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>You're viewing a free preview</h3>
                <p className={`${theme.text.secondary} text-sm mb-4 max-w-md mx-auto`}>
                  Upgrade to unlock all topics, question breakdowns, patterns, and technologies.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/apply" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all">
                    <Crown className="w-4 h-4" />
                    Get Elite — Full Access
                  </Link>
                  <Link to="/apply" className={`inline-flex items-center gap-2 px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium hover:border-blue-500/50 transition-all`}>
                    Get Pro — Partial Access
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-14 pt-8 border-t ${theme.border.primary}`}>
              {prev ? (
                <Link
                  to={`/learn/system-design/${prev.slug}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl ${theme.bg.card} border ${theme.border.primary} hover:border-[#06b6d4]/50 transition-all group`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#06b6d4]" />
                  <div className="text-left">
                    <p className={`text-xs ${theme.text.muted}`}>Previous</p>
                    <p className={`text-sm font-medium ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}>{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  to={`/learn/system-design/${next.slug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all group"
                >
                  <div className="text-right">
                    <p className="text-xs opacity-80">Next</p>
                    <p className="text-sm font-medium">{next.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/learn/system-design"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Course Complete!</span>
                </Link>
              )}
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SystemDesignLesson;
