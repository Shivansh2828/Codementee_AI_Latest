import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, RotateCcw, ChevronDown, Loader2, Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const LANGUAGES = [
  { id: 'python', label: 'Python', monacoId: 'python', template: '# Write your solution here\n\ndef solution():\n    pass\n\nsolution()\n' },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript', template: '// Write your solution here\n\nfunction solution() {\n  \n}\n\nsolution();\n' },
  { id: 'java', label: 'Java', monacoId: 'java', template: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        \n    }\n}\n' },
  { id: 'c++', label: 'C++', monacoId: 'cpp', template: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}\n' },
  { id: 'typescript', label: 'TypeScript', monacoId: 'typescript', template: '// Write your solution here\n\nfunction solution(): void {\n  \n}\n\nsolution();\n' },
  { id: 'go', label: 'Go', monacoId: 'go', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Write your solution here\n\tfmt.Println("Hello")\n}\n' },
];

const CodePlayground = ({ problem, onClose }) => {
  const { theme, isDark } = useTheme();
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const editorRef = useRef(null);
  const langMenuRef = useRef(null);

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    setCode(newLang.template);
    setShowLangMenu(false);
  }, []);

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await api.post('/code/execute', {
        language: lang.id,
        code: code,
        stdin: stdin,
      });
      const data = res.data;
      setOutput({
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        code: data.code,
        signal: null,
        time: data.time,
        memory: data.memory,
        status: data.status,
      });
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Execution failed';
      setOutput({ stdout: '', stderr: msg, code: 1, signal: null });
    }
    setRunning(false);
  }, [code, lang, stdin]);

  const resetCode = useCallback(() => {
    setCode(lang.template);
    setOutput(null);
    setStdin('');
  }, [lang]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // Close lang menu on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative ${expanded ? 'w-full h-full' : 'w-[95vw] max-w-5xl h-[90vh]'} flex flex-col rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-300`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3 min-w-0">
            <Terminal className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{problem?.name || 'Code Playground'}</span>
            {problem?.difficulty && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>{problem.difficulty}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {problem?.url && (
              <a href={problem.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--accent)] hover:underline hidden sm:block">
                View on LeetCode ↗
              </a>
            )}
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors">
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          {/* Language selector */}
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--accent)] transition-colors">
              {lang.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-lg z-10 py-1">
                {LANGUAGES.map((l) => (
                  <button key={l.id} onClick={() => switchLang(l)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-tertiary)] transition-colors ${l.id === lang.id ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Reset */}
          <button onClick={resetCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          {/* Run */}
          <button onClick={runCode} disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-all disabled:opacity-50">
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor */}
          <div className="flex-1 min-h-0 min-w-0">
            <Editor
              height="100%"
              language={lang.monacoId}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                tabSize: 4,
                wordWrap: 'on',
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />
          </div>

          {/* Output panel */}
          <div className="md:w-[340px] border-t md:border-t-0 md:border-l border-[var(--border-primary)] flex flex-col bg-[var(--bg-secondary)] min-h-[150px] md:min-h-0">
            {/* Stdin */}
            <div className="border-b border-[var(--border-primary)]">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Input (stdin)</div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here..."
                className="w-full px-3 py-2 text-xs font-mono bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none h-16"
              />
            </div>

            {/* Output */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Output</span>
                {output && (
                  <span className={`text-[10px] font-medium ${output.code === 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {output.code === 0 ? '✓ Success' : '✗ Error'}
                    {output.time && ` · ${output.time}s`}
                    {output.memory && ` · ${Math.round(output.memory / 1024)}MB`}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-auto px-3 pb-3">
                {running && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing...
                  </div>
                )}
                {!running && !output && (
                  <div className="text-xs text-[var(--text-muted)] py-4">
                    Click "Run Code" to see output here.
                  </div>
                )}
                {!running && output && (
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words text-[var(--text-primary)]">
                    {output.stdout}
                    {output.stderr && <span className="text-[var(--error)]">{output.stderr}</span>}
                    {output.signal && <span className="text-[var(--warning)]">{'\n'}Signal: {output.signal}</span>}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
