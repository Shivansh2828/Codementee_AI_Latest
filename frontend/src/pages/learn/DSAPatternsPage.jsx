import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronRight, BookOpen, Clock, Zap, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { DSA_PATTERNS, DSA_META } from '../../data/dsaPatterns';

const diffColors = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
};

const patternColors = {
  cyan: 'border-cyan-500/30', blue: 'border-blue-500/30', green: 'border-green-500/30',
  purple: 'border-purple-500/30', orange: 'border-orange-500/30', red: 'border-red-500/30',
};
const patternAccent = {
  cyan: 'text-cyan-400', blue: 'text-blue-400', green: 'text-green-400',
  purple: 'text-purple-400', orange: 'text-orange-400', red: 'text-red-400',
};

const ProblemRow = ({ problem, theme }) => (
  <a
    href={problem.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${theme.bg.secondary} ${theme.bg.hover} transition-colors group`}
  >
    <span className={`text-sm ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}>
      {problem.name}
    </span>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffColors[problem.difficulty]}`}>
        {problem.difficulty}
      </span>
      <ExternalLink className={`w-3.5 h-3.5 ${theme.text.muted} group-hover:text-[#06b6d4] transition-colors`} />
    </div>
  </a>
);

const PatternCard = ({ pattern, theme }) => {
  const [open, setOpen] = useState(false);
  const totalProblems = pattern.subcategories
    ? pattern.subcategories.reduce((sum, sc) => sum + sc.problems.length, 0)
    : pattern.problems?.length || 0;

  return (
    <div className={`rounded-2xl ${theme.bg.card} border ${patternColors[pattern.color]} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold ${theme.text.primary}`}>{pattern.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              pattern.difficulty.includes('Hard') ? 'bg-red-500/20 text-red-400' :
              pattern.difficulty.includes('Medium') ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>{pattern.difficulty}</span>
            <span className={`text-xs ${theme.text.muted}`}>{totalProblems} problems</span>
          </div>
          <p className={`text-sm ${theme.text.muted} mt-1 line-clamp-2`}>{pattern.description}</p>
        </div>
        {open ? <ChevronDown className={`w-5 h-5 ${patternAccent[pattern.color]} shrink-0`} /> : <ChevronRight className={`w-5 h-5 ${theme.text.muted} shrink-0`} />}
      </button>

      {open && (
        <div className={`px-5 pb-5 border-t ${theme.border.primary}`}>
          {/* When to use */}
          <div className={`mt-4 mb-4 p-3 rounded-lg bg-[#06b6d4]/5 border border-[#06b6d4]/20`}>
            <p className="text-xs text-[#06b6d4] font-semibold mb-1">When to use this pattern:</p>
            <p className={`text-sm ${theme.text.secondary}`}>{pattern.whenToUse}</p>
          </div>

          {/* Problems */}
          {pattern.subcategories ? (
            <div className="space-y-4">
              {pattern.subcategories.map((sc, i) => (
                <div key={i}>
                  <p className={`text-xs font-semibold ${patternAccent[pattern.color]} uppercase tracking-wider mb-2`}>{sc.name}</p>
                  <div className="space-y-1.5">
                    {sc.problems.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {pattern.problems?.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DSAPatternsPage = () => {
  const { theme } = useTheme();
  const [expandAll, setExpandAll] = useState(false);

  const totalProblems = DSA_PATTERNS.reduce((sum, p) => {
    if (p.subcategories) return sum + p.subcategories.reduce((s, sc) => s + sc.problems.length, 0);
    return sum + (p.problems?.length || 0);
  }, 0);

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-4xl mx-auto px-4">

          {/* Back to Courses */}
          <Link to="/learn" className={`inline-flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mb-8`}>
            <ArrowLeft className="w-4 h-4" />
            All Courses
          </Link>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">100% Free — No Login Required</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-4 leading-tight`}>
              {DSA_META.title}
            </h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-6`}>
              {DSA_META.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-6">
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <BookOpen className="w-4 h-4 text-[#06b6d4]" />
                <span>{DSA_PATTERNS.length} patterns</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>{totalProblems}+ problems</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <Clock className="w-4 h-4 text-purple-400" />
                <span>All linked to LeetCode</span>
              </div>
            </div>
            <p className={`text-sm ${theme.text.muted} max-w-lg mx-auto`}>
              Don't memorize solutions. Learn the pattern, solve 3-5 problems, and you'll recognize it in any interview.
            </p>
          </div>

          {/* Expand/Collapse toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setExpandAll(!expandAll)}
              className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}
            >
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Pattern Cards */}
          <div className="space-y-3">
            {DSA_PATTERNS.map((pattern) => (
              expandAll
                ? <PatternCardExpanded key={pattern.id} pattern={pattern} theme={theme} />
                : <PatternCard key={pattern.id} pattern={pattern} theme={theme} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={`mt-14 p-8 rounded-2xl ${theme.bg.card} border-2 border-[#06b6d4]/20 text-center`}>
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
              Ready to test your skills?
            </h3>
            <p className={`${theme.text.secondary} mb-6 text-sm`}>
              Book a mock coding interview with a MAANG engineer and get detailed feedback on your approach.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200"
            >
              Book a Mock Interview
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

// Always-expanded version for "Expand All"
const PatternCardExpanded = ({ pattern, theme }) => {
  const totalProblems = pattern.subcategories
    ? pattern.subcategories.reduce((sum, sc) => sum + sc.problems.length, 0)
    : pattern.problems?.length || 0;

  return (
    <div className={`rounded-2xl ${theme.bg.card} border ${patternColors[pattern.color]} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className={`font-semibold ${theme.text.primary}`}>{pattern.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            pattern.difficulty.includes('Hard') ? 'bg-red-500/20 text-red-400' :
            pattern.difficulty.includes('Medium') ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>{pattern.difficulty}</span>
          <span className={`text-xs ${theme.text.muted}`}>{totalProblems} problems</span>
        </div>
        <p className={`text-sm ${theme.text.muted} mb-3`}>{pattern.description}</p>
        <div className={`mb-4 p-3 rounded-lg bg-[#06b6d4]/5 border border-[#06b6d4]/20`}>
          <p className="text-xs text-[#06b6d4] font-semibold mb-1">When to use:</p>
          <p className={`text-sm ${theme.text.secondary}`}>{pattern.whenToUse}</p>
        </div>
        {pattern.subcategories ? (
          <div className="space-y-4">
            {pattern.subcategories.map((sc, i) => (
              <div key={i}>
                <p className={`text-xs font-semibold ${patternAccent[pattern.color]} uppercase tracking-wider mb-2`}>{sc.name}</p>
                <div className="space-y-1.5">
                  {sc.problems.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {pattern.problems?.map((p, j) => <ProblemRow key={j} problem={p} theme={theme} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAPatternsPage;
