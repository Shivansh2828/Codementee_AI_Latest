import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, RotateCcw, Lightbulb, ChevronDown, Loader2, WifiOff } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const CHALLENGES = [
  { title: 'List all files including hidden ones', hint: 'ls -la', difficulty: 'Beginner' },
  { title: 'View the syslog file', hint: 'cat syslog.txt', difficulty: 'Beginner' },
  { title: 'Find failed SSH login attempts', hint: 'grep "Failed" syslog.txt', difficulty: 'Beginner' },
  { title: 'Count lines in access.log', hint: 'wc -l access.log', difficulty: 'Beginner' },
  { title: 'Show top 5 lines of data.csv', hint: 'head -5 data.csv', difficulty: 'Beginner' },
  { title: 'Find all 500 errors in access log', hint: 'grep " 500 " access.log', difficulty: 'Intermediate' },
  { title: 'Count HTTP status codes', hint: "awk '{print $9}' access.log | sort | uniq -c | sort -rn", difficulty: 'Intermediate' },
  { title: 'Extract unique IPs from access log', hint: "awk '{print $1}' access.log | sort -u", difficulty: 'Intermediate' },
  { title: 'Find top 3 IPs by request count', hint: "awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3", difficulty: 'Advanced' },
  { title: 'Show salaries above 90000 from CSV', hint: "awk -F, '$4 > 90000 {print $1, $4}' data.csv", difficulty: 'Advanced' },
  { title: 'Replace a word in a file using sed', hint: "sed 's/alice/ALICE/g' data.csv", difficulty: 'Intermediate' },
  { title: 'Run a bash script', hint: 'bash deploy.sh', difficulty: 'Beginner' },
  { title: 'Check running processes', hint: 'ps aux', difficulty: 'Beginner' },
  { title: 'Check disk usage', hint: 'df -h', difficulty: 'Beginner' },
  { title: 'Write a one-liner to count errors', hint: "grep -c 'error\\|Error\\|ERROR' syslog.txt", difficulty: 'Intermediate' },
];

const diffColor = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
};

const WS_BASE = (() => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  // Convert http(s):// to ws(s)://
  return backendUrl.replace(/^http/, 'ws');
})();

const LinuxPlayground = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const termRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const sessionIdRef = useRef(null);
  const containerRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | loading | connected | error | disconnected
  const [errorMsg, setErrorMsg] = useState('');
  const [showChallenges, setShowChallenges] = useState(true);
  const [revealedHints, setRevealedHints] = useState({});

  const cleanup = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
    if (sessionIdRef.current) {
      try {
        await api.delete(`/terminal/${sessionIdRef.current}`);
      } catch (_) {}
      sessionIdRef.current = null;
    }
  }, []);

  const startSession = useCallback(async () => {
    await cleanup();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Create session on backend
      const res = await api.post('/terminal/create');
      const { session_id } = res.data;
      sessionIdRef.current = session_id;

      // Dynamically import xterm to avoid SSR issues
      const { Terminal: XTerm } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      // Import xterm CSS
      await import('@xterm/xterm/css/xterm.css');

      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        theme: {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
          black: '#484f58',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc',
        },
        allowTransparency: false,
        scrollback: 1000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Mount terminal into DOM
      if (termRef.current) {
        term.open(termRef.current);
        fitAddon.fit();
      }

      // Connect WebSocket
      const wsUrl = `${WS_BASE}/ws/terminal/${session_id}`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        // Send initial resize
        const { cols, rows } = term;
        ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      };

      ws.onmessage = (event) => {
        const data = event.data instanceof ArrayBuffer
          ? new Uint8Array(event.data)
          : event.data;
        term.write(data);
      };

      ws.onerror = () => {
        setStatus('error');
        setErrorMsg('Connection error. Please try again.');
      };

      ws.onclose = () => {
        if (status !== 'idle') {
          setStatus('disconnected');
          term.write('\r\n\x1b[33mSession ended. Click "New Session" to reconnect.\x1b[0m\r\n');
        }
      };

      // Send terminal input to WebSocket
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(new TextEncoder().encode(data));
        }
      });

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        try {
          fitAddon.fit();
          const { cols, rows } = term;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          }
        } catch (_) {}
      });
      if (termRef.current) resizeObserver.observe(termRef.current);

      term.focus();

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Failed to start terminal. Please try again.');
    }
  }, [cleanup, status]);

  // Start session on mount
  useEffect(() => {
    if (user) startSession();
    return () => { cleanup(); };
  }, [user]); // eslint-disable-line

  const handleReset = () => startSession();

  const pasteHint = (hint) => {
    if (xtermRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(new TextEncoder().encode(hint));
      xtermRef.current.focus();
    }
  };

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
            <button
              onClick={handleReset}
              disabled={status === 'loading'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${theme.bg.card} border ${theme.border.primary} ${theme.text.muted} hover:text-[#06b6d4] hover:border-[#06b6d4]/50 transition-all disabled:opacity-50`}
            >
              {status === 'loading'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RotateCcw className="w-3.5 h-3.5" />}
              {status === 'loading' ? 'Starting...' : 'New Session'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">

            {/* Terminal */}
            <div className="flex-1 min-w-0">
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-xs text-[#8b949e] font-mono">playground@codementee: ~</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'connected' && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    )}
                    {status === 'loading' && (
                      <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Starting container...
                      </span>
                    )}
                    {(status === 'error' || status === 'disconnected') && (
                      <span className="flex items-center gap-1 text-[10px] text-red-400">
                        <WifiOff className="w-3 h-3" />
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>

                {/* Terminal body */}
                <div className="relative" style={{ height: '500px' }}>
                  {/* xterm.js mounts here */}
                  <div ref={termRef} className="w-full h-full p-2" />

                  {/* Loading overlay */}
                  {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]">
                      <Loader2 className="w-8 h-8 text-[#06b6d4] animate-spin mb-3" />
                      <p className="text-[#8b949e] text-sm font-mono">Spinning up your Linux container...</p>
                      <p className="text-[#484f58] text-xs font-mono mt-1">This takes ~5 seconds</p>
                    </div>
                  )}

                  {/* Error overlay */}
                  {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]">
                      <WifiOff className="w-8 h-8 text-red-400 mb-3" />
                      <p className="text-red-400 text-sm font-mono mb-1">Failed to start terminal</p>
                      <p className="text-[#8b949e] text-xs font-mono mb-4">{errorMsg}</p>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-[#06b6d4] text-white text-sm rounded-lg hover:bg-[#0891b2] transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className={`text-xs ${theme.text.muted} mt-2 text-center`}>
                Real Linux environment in an isolated container · Sessions auto-expire after 10 min of inactivity
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
                    <p className={`text-xs ${theme.text.muted} mt-0.5`}>Click a hint to paste it into the terminal</p>
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
                            onClick={() => pasteHint(ch.hint + '\n')}
                            title="Click to run in terminal"
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
