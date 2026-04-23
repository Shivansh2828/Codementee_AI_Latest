import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, RotateCcw, Lightbulb, ChevronDown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinuxSimulator } from '../../data/linuxSimulator';

const CHALLENGES = [
  { title: 'Find the top 3 IPs in the access log', hint: "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -3", difficulty: 'Beginner' },
  { title: 'Count the number of 500 errors', hint: 'grep " 500 " /var/log/nginx/access.log | wc -l', difficulty: 'Beginner' },
  { title: 'Find failed SSH login attempts', hint: 'grep "Failed" /var/log/auth.log', difficulty: 'Beginner' },
  { title: 'List all usernames from /etc/passwd', hint: "cut -d: -f1 /etc/passwd", difficulty: 'Beginner' },
  { title: 'Find the Java process and its CPU usage', hint: 'ps aux | grep java', difficulty: 'Intermediate' },
  { title: 'Check disk usage in human-readable format', hint: 'df -h', difficulty: 'Intermediate' },
  { title: 'Find all .py files in the project', hint: 'find /home/ubuntu/projects -name "*.py"', difficulty: 'Intermediate' },
  { title: 'Extract URLs that returned 500 from access log', hint: "awk '$9 == 500 {print $7}' /var/log/nginx/access.log", difficulty: 'Advanced' },
  { title: 'Count HTTP status codes from access log', hint: "awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn", difficulty: 'Advanced' },
  { title: 'Find lines with "error" in syslog (case-insensitive)', hint: 'grep -i "error" /var/log/syslog', difficulty: 'Beginner' },
  { title: 'Show the max_connections value from config', hint: 'grep "max_connections" /home/ubuntu/projects/app/config.yml', difficulty: 'Beginner' },
  { title: 'Replace "debug: false" with "debug: true" in config', hint: "sed 's/debug: false/debug: true/' /home/ubuntu/projects/app/config.yml", difficulty: 'Intermediate' },
];

const diffColor = { Beginner: 'text-[var(--green)]', Intermediate: 'text-[var(--yellow)]', Advanced: 'text-[var(--red)]' };

const LinuxPlayground = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sim] = useState(() => new LinuxSimulator());
  const [lines, setLines] = useState([{ type: 'system', text: 'Welcome to the Linux Playground! Type commands to practice.\nType "help" for available commands and sample files.\n' }]);
  const [input, setInput] = useState('');
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showChallenges, setShowChallenges] = useState(true);
  const [revealedHints, setRevealedHints] = useState({});
  const termRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [lines, scrollToBottom]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const prompt = sim.getPrompt();
    const output = sim.execute(cmd);

    if (output === '\x1BCLEAR') {
      setLines([]);
    } else {
      setLines(prev => [
        ...prev,
        { type: 'input', text: prompt + cmd },
        ...(output ? [{ type: 'output', text: output }] : []),
      ]);
    }
    setInput('');
    setHistoryIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = sim.history;
      if (hist.length === 0) return;
      const newIdx = historyIdx < hist.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(newIdx);
      setInput(hist[hist.length - 1 - newIdx] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx <= 0) { setHistoryIdx(-1); setInput(''); return; }
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setInput(sim.history[sim.history.length - 1 - newIdx] || '');
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for paths
      const parts = input.split(' ');
      const last = parts[parts.length - 1];
      if (last) {
        const dir = last.includes('/') ? last.substring(0, last.lastIndexOf('/') + 1) : '';
        const prefix = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last;
        const resolved = dir ? (dir.startsWith('/') ? dir : sim.cwd + '/' + dir) : sim.cwd;
        const node = sim.fs[resolved.replace(/\/$/, '') || '/'];
        if (node?.children) {
          const matches = node.children.filter(c => c.startsWith(prefix));
          if (matches.length === 1) {
            parts[parts.length - 1] = dir + matches[0];
            setInput(parts.join(' '));
          }
        }
      }
    }
  };

  const handleReset = () => {
    sim.reset();
    setLines([{ type: 'system', text: 'Terminal reset. File system restored to initial state.\nType "help" for available commands.\n' }]);
    setInput('');
  };

  const focusInput = () => inputRef.current?.focus();

  // Login gate
  if (!user) {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <Terminal className="w-16 h-16 text-[#06b6d4] mx-auto mb-4" />
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>Linux Playground</h1>
            <p className={`${theme.text.secondary} mb-6`}>Sign in to access the interactive Linux terminal.</p>
            <div className="space-y-3">
              <Link to="/login" className="block w-full px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl text-center">Sign In</Link>
              <Link to="/register" className={`block w-full px-6 py-3 ${theme.bg.card} border ${theme.border.primary} rounded-xl ${theme.text.primary} font-medium text-center`}>Create Account</Link>
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
      <main className="pt-20 pb-10">
        <div className="container max-w-7xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 pt-4">
            <div className="flex items-center gap-3">
              <Link to="/learn/linux" className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
                <ArrowLeft className="w-4 h-4 inline mr-1" />Linux Course
              </Link>
              <span className={`text-sm ${theme.text.muted}`}>/</span>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#06b6d4]" />
                <h1 className={`text-lg font-bold ${theme.text.primary}`}>Linux Playground</h1>
              </div>
            </div>
            <button onClick={handleReset} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${theme.bg.card} border ${theme.border.primary} ${theme.text.muted} hover:text-[#06b6d4] hover:border-[#06b6d4]/50 transition-all`}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">

            {/* Terminal */}
            <div className="flex-1 min-w-0">
              <div
                className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl cursor-text"
                onClick={focusInput}
              >
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-xs text-[#8b949e] ml-2 font-mono">ubuntu@codementee: ~</span>
                </div>

                {/* Terminal body */}
                <div ref={termRef} className="p-4 h-[500px] overflow-y-auto font-mono text-sm leading-relaxed">
                  {lines.map((line, i) => (
                    <div key={i} className={`whitespace-pre-wrap break-all ${
                      line.type === 'system' ? 'text-[#58a6ff]' :
                      line.type === 'input' ? 'text-[#c9d1d9]' :
                      'text-[#8b949e]'
                    }`}>
                      {line.text}
                    </div>
                  ))}

                  {/* Input line */}
                  <form onSubmit={handleSubmit} className="flex items-center text-[#c9d1d9]">
                    <span className="text-[#3fb950] shrink-0">{sim.getPrompt()}</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent outline-none text-[#c9d1d9] caret-[#58a6ff] font-mono text-sm"
                      autoComplete="off"
                      spellCheck="false"
                      autoCapitalize="off"
                    />
                  </form>
                </div>
              </div>

              <p className={`text-xs ${theme.text.muted} mt-2 text-center`}>
                Simulated terminal — supports core Linux commands with sample data. Use ↑↓ for history, Tab for autocomplete.
              </p>
            </div>

            {/* Challenges sidebar */}
            <div className="lg:w-80 shrink-0">
              <button
                onClick={() => setShowChallenges(!showChallenges)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${theme.bg.card} border ${theme.border.primary} mb-2 lg:hidden`}
              >
                <span className={`text-sm font-medium ${theme.text.primary}`}>Practice Challenges</span>
                <ChevronDown className={`w-4 h-4 ${theme.text.muted} transition-transform ${showChallenges ? '' : '-rotate-90'}`} />
              </button>

              <div className={`${showChallenges ? 'block' : 'hidden lg:block'}`}>
                <div className={`${theme.bg.card} border ${theme.border.primary} rounded-xl overflow-hidden`}>
                  <div className={`px-4 py-3 border-b ${theme.border.primary}`}>
                    <h2 className={`text-sm font-bold ${theme.text.primary}`}>Practice Challenges</h2>
                    <p className={`text-xs ${theme.text.muted} mt-0.5`}>Try solving these in the terminal</p>
                  </div>
                  <div className="max-h-[460px] overflow-y-auto divide-y divide-[var(--border-primary)]">
                    {CHALLENGES.map((ch, i) => (
                      <div key={i} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium ${theme.text.primary} leading-relaxed`}>{ch.title}</p>
                          <span className={`text-[10px] shrink-0 ${diffColor[ch.difficulty]}`}>{ch.difficulty}</span>
                        </div>
                        <button
                          onClick={() => setRevealedHints(prev => ({ ...prev, [i]: !prev[i] }))}
                          className={`flex items-center gap-1 mt-1.5 text-[10px] ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}
                        >
                          <Lightbulb className="w-3 h-3" />
                          {revealedHints[i] ? 'Hide hint' : 'Show hint'}
                        </button>
                        {revealedHints[i] && (
                          <code
                            className="block mt-1.5 px-2 py-1.5 rounded bg-[#0d1117] text-[10px] text-[#58a6ff] font-mono cursor-pointer hover:bg-[#161b22] transition-colors break-all"
                            onClick={() => { setInput(ch.hint); inputRef.current?.focus(); }}
                            title="Click to paste into terminal"
                          >
                            {ch.hint}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LinuxPlayground;
