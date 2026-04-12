import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronRight, BookOpen, Clock, Zap, ArrowRight, ArrowLeft, CheckCircle, Filter, Building2, BarChart3, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { DSA_PATTERNS, DSA_META } from '../../data/dsaPatterns';
import { getCompaniesForProblem, getAllCompanies } from '../../data/companyTags';
import api from '../../utils/api';

const diffColors = {
  Easy: 'bg-[var(--green-bg)] text-[var(--green)]',
  Medium: 'bg-[var(--yellow-bg)] text-[var(--yellow)]',
  Hard: 'bg-[var(--red-bg)] text-[var(--red)]',
};
const patternColors = {
  cyan: 'border-[var(--cyan-border)]', blue: 'border-[var(--blue-border)]', green: 'border-[var(--green-border)]',
  purple: 'border-[var(--purple-border)]', orange: 'border-[var(--orange-border)]', red: 'border-[var(--red-border)]',
};
const patternAccent = {
  cyan: 'text-[var(--cyan)]', blue: 'text-[var(--blue)]', green: 'text-[var(--green)]',
  purple: 'text-[var(--purple)]', orange: 'text-[var(--orange)]', red: 'text-[var(--red)]',
};

// ── Progress Hook ────────────────────────────────────────────────────────────
const useProgress = () => {
  const { isAuthenticated } = useAuth();
  const [completed, setCompleted] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/learning/progress');
          setCompleted(new Set(res.data.completed_problems || []));
        } catch { /* ignore */ }
      } else {
        const saved = localStorage.getItem('dsa_progress');
        if (saved) setCompleted(new Set(JSON.parse(saved)));
      }
      setLoaded(true);
    };
    load();
  }, [isAuthenticated]);

  const toggle = useCallback(async (url) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      if (!isAuthenticated) localStorage.setItem('dsa_progress', JSON.stringify([...next]));
      return next;
    });
    if (isAuthenticated) {
      try { await api.post('/learning/progress/toggle', { item_id: url, item_type: 'problem' }); } catch { /* ignore */ }
    }
  }, [isAuthenticated]);

  return { completed, toggle, loaded };
};

// ── Problem Row with checkbox ────────────────────────────────────────────────
const ProblemRow = ({ problem, theme, isCompleted, onToggle, companyFilter }) => {
  const companies = getCompaniesForProblem(problem.url);
  if (companyFilter && !companies.includes(companyFilter)) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.secondary} transition-colors group ${isCompleted ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(problem.url)} className="shrink-0" title={isCompleted ? 'Mark incomplete' : 'Mark complete'}>
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 border-green-500' : `${theme.border.primary} border hover:border-green-400`}`}>
          {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
      </button>
      <a href={problem.url} target="_blank" rel="noopener noreferrer" className={`flex-1 text-sm ${isCompleted ? 'line-through' : ''} ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}>
        {problem.name}
      </a>
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        {companies.slice(0, 3).map((c, i) => (
          <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${theme.bg.card} ${theme.text.muted} border ${theme.border.primary}`}>{c}</span>
        ))}
        {companies.length > 3 && <span className={`text-[9px] ${theme.text.muted}`}>+{companies.length - 3}</span>}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffColors[problem.difficulty]}`}>{problem.difficulty}</span>
        <a href={problem.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className={`w-3.5 h-3.5 ${theme.text.muted} group-hover:text-[#06b6d4] transition-colors`} />
        </a>
      </div>
    </div>
  );
};

// ── Pattern Card ─────────────────────────────────────────────────────────────
const PatternCard = ({ pattern, theme, completed, onToggle, companyFilter, diffFilter, forceOpen = false }) => {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const allProblems = pattern.subcategories
    ? pattern.subcategories.flatMap(sc => sc.problems)
    : pattern.problems || [];
  const filteredProblems = allProblems.filter(p => {
    if (diffFilter && p.difficulty !== diffFilter) return false;
    if (companyFilter && !getCompaniesForProblem(p.url).includes(companyFilter)) return false;
    return true;
  });
  const completedCount = allProblems.filter(p => completed.has(p.url)).length;
  const totalCount = allProblems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (filteredProblems.length === 0 && (companyFilter || diffFilter)) return null;

  return (
    <div className={`rounded-2xl ${theme.bg.card} border ${patternColors[pattern.color]} overflow-hidden transition-all duration-200`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-5 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold ${theme.text.primary}`}>{pattern.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pattern.difficulty.includes('Hard') ? 'bg-[var(--red-bg)] text-[var(--red)]' : pattern.difficulty.includes('Medium') ? 'bg-[var(--yellow-bg)] text-[var(--yellow)]' : 'bg-[var(--green-bg)] text-[var(--green)]'}`}>{pattern.difficulty}</span>
            <span className={`text-xs ${theme.text.muted}`}>{completedCount}/{totalCount}</span>
          </div>
          <p className={`text-sm ${theme.text.muted} mt-1 line-clamp-1`}>{pattern.description}</p>
          {/* Progress bar */}
          <div className={`mt-2 h-1.5 rounded-full ${theme.bg.secondary} overflow-hidden`}>
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {isOpen ? <ChevronDown className={`w-5 h-5 ${patternAccent[pattern.color]} shrink-0`} /> : <ChevronRight className={`w-5 h-5 ${theme.text.muted} shrink-0`} />}
      </button>
      {isOpen && (
        <div className={`px-5 pb-5 border-t ${theme.border.primary}`}>
          <div className={`mt-4 mb-4 p-3 rounded-lg bg-[#06b6d4]/5 border border-[#06b6d4]/20`}>
            <p className="text-xs text-[#06b6d4] font-semibold mb-1">When to use this pattern:</p>
            <p className={`text-sm ${theme.text.secondary}`}>{pattern.whenToUse}</p>
          </div>
          {pattern.subcategories ? (
            <div className="space-y-4">
              {pattern.subcategories.map((sc, i) => {
                const scFiltered = sc.problems.filter(p => {
                  if (diffFilter && p.difficulty !== diffFilter) return false;
                  if (companyFilter && !getCompaniesForProblem(p.url).includes(companyFilter)) return false;
                  return true;
                });
                if (scFiltered.length === 0) return null;
                return (
                  <div key={i}>
                    <p className={`text-xs font-semibold ${patternAccent[pattern.color]} uppercase tracking-wider mb-2`}>{sc.name}</p>
                    <div className="space-y-1.5">
                      {scFiltered.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} isCompleted={completed.has(p.url)} onToggle={onToggle} companyFilter={null} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredProblems.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} isCompleted={completed.has(p.url)} onToggle={onToggle} companyFilter={null} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const DSAPatternsPage = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { completed, toggle, loaded } = useProgress();
  const [expandAll, setExpandAll] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');

  const allProblems = DSA_PATTERNS.flatMap(p => p.subcategories ? p.subcategories.flatMap(sc => sc.problems) : p.problems || []);
  const totalProblems = allProblems.length;
  const totalCompleted = allProblems.filter(p => completed.has(p.url)).length;
  const overallProgress = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-4xl mx-auto px-4">

          <Link to="/learn" className={`inline-flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mb-8`}>
            <ArrowLeft className="w-4 h-4" /> All Courses
          </Link>

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-bg)] border border-[var(--green-border)] mb-6">
              <Zap className="w-4 h-4 text-[var(--green)]" />
              <span className="text-sm font-semibold text-[var(--green)]">100% Free — Track Your Progress</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-4`}>{DSA_META.title}</h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-6`}>{DSA_META.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className={`flex items-center gap-2 ${theme.text.muted}`}><BookOpen className="w-4 h-4 text-[#06b6d4]" /><span>{DSA_PATTERNS.length} patterns</span></div>
              <div className={`flex items-center gap-2 ${theme.text.muted}`}><CheckCircle className="w-4 h-4 text-[var(--green)]" /><span>{totalCompleted}/{totalProblems} solved</span></div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-5 mb-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${theme.text.primary}`}>Overall Progress</span>
              <span className={`text-sm font-bold ${overallProgress === 100 ? 'text-[var(--green)]' : 'text-[var(--accent)]'}`}>{overallProgress}%</span>
            </div>
            <div className={`h-2.5 rounded-full ${theme.bg.secondary} overflow-hidden`}>
              <div className={`h-full rounded-full transition-all duration-700 ${overallProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]'}`} style={{ width: `${overallProgress}%` }} />
            </div>
            {!isAuthenticated && loaded && (
              <p className={`text-xs ${theme.text.muted} mt-2`}>
                Progress saved locally. <Link to="/login" className="text-[#06b6d4] hover:underline">Log in</Link> to save across devices.
              </p>
            )}
          </div>

          {/* Filters */}
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-4 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${theme.text.primary}`}>
                <Filter className="w-4 h-4 text-[#06b6d4]" /> Filters
                {(companyFilter || diffFilter) && <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />}
              </div>
              <div className="flex items-center gap-2">
                {(companyFilter || diffFilter) && (
                  <span className={`text-xs px-2 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] font-medium`}>
                    {DSA_PATTERNS.reduce((sum, p) => {
                      const probs = p.subcategories ? p.subcategories.flatMap(sc => sc.problems) : p.problems || [];
                      return sum + probs.filter(pr => {
                        if (diffFilter && pr.difficulty !== diffFilter) return false;
                        if (companyFilter && !getCompaniesForProblem(pr.url).includes(companyFilter)) return false;
                        return true;
                      }).length;
                    }, 0)} problems match
                  </span>
                )}
                {(companyFilter || diffFilter) && (
                  <button onClick={() => { setCompanyFilter(''); setDiffFilter(''); }} className={`text-xs ${theme.text.muted} hover:text-[var(--red)] transition-colors`}>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Company filter */}
              <div className="flex-1 min-w-[200px]">
                <label className={`text-xs ${theme.text.muted} mb-1 block`}><Building2 className="w-3 h-3 inline mr-1" />Company</label>
                <select value={companyFilter} onChange={e => { setCompanyFilter(e.target.value); if (e.target.value) setExpandAll(true); }} className={`w-full px-3 py-2 rounded-lg text-sm ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} focus:outline-none focus:border-[#06b6d4]`}>
                  <option value="">All Companies</option>
                  {getAllCompanies().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Difficulty filter */}
              <div className="flex-1 min-w-[200px]">
                <label className={`text-xs ${theme.text.muted} mb-1 block`}><BarChart3 className="w-3 h-3 inline mr-1" />Difficulty</label>
                <select value={diffFilter} onChange={e => { setDiffFilter(e.target.value); if (e.target.value) setExpandAll(true); }} className={`w-full px-3 py-2 rounded-lg text-sm ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} focus:outline-none focus:border-[#06b6d4]`}>
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expand/Collapse */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setExpandAll(!expandAll)} className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              {(expandAll || companyFilter || diffFilter) ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Pattern Cards */}
          <div className="space-y-3">
            {DSA_PATTERNS.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} theme={theme} completed={completed} onToggle={toggle} companyFilter={companyFilter} diffFilter={diffFilter} forceOpen={expandAll} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={`mt-14 p-8 rounded-2xl ${theme.bg.card} border-2 border-[#06b6d4]/20 text-center`}>
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Ready to test your skills?</h3>
            <p className={`${theme.text.secondary} mb-6 text-sm`}>Book a mock coding interview with a MAANG engineer and get detailed feedback.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200">
              Book a Mock Interview <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};


export default DSAPatternsPage;
