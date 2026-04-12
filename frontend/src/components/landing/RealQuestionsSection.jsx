import React from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Code,
  Server,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { sampleQuestions } from '../../data/questionsData';

const typeConfig = {
  coding: {
    label: 'Coding',
    icon: Code,
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  system_design: {
    label: 'System Design',
    icon: Server,
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  behavioral: {
    label: 'Behavioral',
    icon: Users,
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
};

const difficultyConfig = {
  easy: { label: 'Easy', bg: 'bg-green-500/10', text: 'text-green-400' },
  medium: { label: 'Medium', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  hard: { label: 'Hard', bg: 'bg-red-500/10', text: 'text-red-400' },
};

const RealQuestionsSection = () => {
  const { theme } = useTheme();

  // Group questions by company
  const grouped = sampleQuestions.reduce((acc, q) => {
    if (!acc[q.company]) acc[q.company] = [];
    acc[q.company].push(q);
    return acc;
  }, {});

  return (
    <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}
          >
            <HelpCircle className="w-4 h-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-[#06b6d4]">
              Real Interview Questions
            </span>
          </div>

          <h2
            className={`text-3xl md:text-5xl font-bold mb-4 ${theme.text.primary} leading-tight`}
          >
            Questions from <span className="text-[#06b6d4]">Top Companies</span>
          </h2>
          <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
            Practice with real questions asked at Amazon, Google, Microsoft, and
            more — grouped by company and difficulty.
          </p>
        </div>

        {/* Questions grouped by company */}
        <div className="max-w-5xl mx-auto space-y-8">
          {Object.entries(grouped).map(([company, questions]) => (
            <div key={company}>
              <h3
                className={`text-xl font-semibold mb-4 ${theme.text.primary}`}
              >
                {company}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q) => {
                  const tConfig = typeConfig[q.type] || typeConfig.coding;
                  const dConfig =
                    difficultyConfig[q.difficulty] || difficultyConfig.medium;
                  const TypeIcon = tConfig.icon;

                  return (
                    <Link
                      key={q.id}
                      to={q.href}
                      className={`group block rounded-xl p-5 border transition-all duration-200 ${theme.bg.card} ${theme.border.primary} hover:border-[#06b6d4]/60 ${theme.shadowMd}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4
                          className={`font-medium ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}
                        >
                          {q.title}
                        </h4>
                        <ArrowRight
                          className={`w-4 h-4 flex-shrink-0 mt-1 ${theme.text.muted} group-hover:text-[#06b6d4] transition-colors`}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tConfig.bg} ${tConfig.text} border ${tConfig.border}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {tConfig.label}
                        </span>
                        {/* Difficulty badge */}
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${dConfig.bg} ${dConfig.text}`}
                        >
                          {dConfig.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Soft monetization banner */}
        <div className="max-w-3xl mx-auto mt-14">
          <div
            className={`rounded-2xl p-8 text-center border ${theme.bg.card} border-[#06b6d4]/20`}
          >
            <Sparkles className="w-6 h-6 text-[#06b6d4] mx-auto mb-3" />
            <p
              className={`text-lg md:text-xl font-semibold mb-2 ${theme.text.primary}`}
            >
              Start free. Go deep when you're ready.
            </p>
            <p className={`text-sm mb-5 ${theme.text.secondary}`}>
              Explore courses, practice questions, and prep resources — upgrade
              anytime for mock interviews and premium content.
            </p>
            <Link
              to="/#pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white font-medium text-sm transition-all"
            >
              View Pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealQuestionsSection;
