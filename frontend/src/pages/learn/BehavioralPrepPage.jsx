import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, Clock, Zap, ArrowRight, ArrowLeft, MessageSquare, Lightbulb } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { BEHAVIORAL_CATEGORIES, BEHAVIORAL_META, STAR_FRAMEWORK } from '../../data/behavioralQuestions';

const colorMap = {
  cyan: 'border-[var(--cyan-border)]', blue: 'border-[var(--blue-border)]', green: 'border-[var(--green-border)]',
  purple: 'border-[var(--purple-border)]', orange: 'border-[var(--orange-border)]', red: 'border-[var(--red-border)]',
};
const accentMap = {
  cyan: 'text-[var(--cyan)]', blue: 'text-[var(--blue)]', green: 'text-[var(--green)]',
  purple: 'text-[var(--purple)]', orange: 'text-[var(--orange)]', red: 'text-[var(--red)]',
};

const QuestionItem = ({ question, theme }) => {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className={`${theme.bg.secondary} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setShowTip(!showTip)}
        className={`w-full flex items-start gap-3 p-4 text-left group`}
      >
        <MessageSquare className={`w-4 h-4 ${theme.text.muted} mt-0.5 shrink-0`} />
        <span className={`text-sm ${theme.text.primary} flex-1`}>
          {question.q}
          {question.example && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)] font-semibold align-middle">Example</span>}
        </span>
        {showTip
          ? <ChevronDown className={`w-4 h-4 text-[#06b6d4] shrink-0 mt-0.5`} />
          : <ChevronRight className={`w-4 h-4 ${theme.text.muted} shrink-0 mt-0.5`} />
        }
      </button>
      {showTip && (
        <div className="px-4 pb-4 pl-11 space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#06b6d4]/5 border border-[#06b6d4]/20">
            <Lightbulb className="w-4 h-4 text-[#06b6d4] shrink-0 mt-0.5" />
            <p className={`text-sm ${theme.text.secondary}`}>{question.tip}</p>
          </div>
          {question.example && (
            <div className={`p-4 rounded-xl ${theme.bg.card} border ${theme.border.primary}`}>
              <p className="text-xs font-semibold text-[var(--green)] uppercase tracking-wider mb-3">Example STAR Answer</p>
              <div className="space-y-3">
                {[
                  { letter: 'S', label: 'Situation', text: question.example.s, color: 'text-[var(--cyan)] bg-[var(--cyan-bg)]' },
                  { letter: 'T', label: 'Task', text: question.example.t, color: 'text-[var(--blue)] bg-[var(--blue-bg)]' },
                  { letter: 'A', label: 'Action', text: question.example.a, color: 'text-[var(--purple)] bg-[var(--purple-bg)]' },
                  { letter: 'R', label: 'Result', text: question.example.r, color: 'text-[var(--green)] bg-[var(--green-bg)]' },
                ].map((step) => (
                  <div key={step.letter} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full ${step.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-xs font-bold">{step.letter}</span>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${step.color.split(' ')[0]} mb-0.5`}>{step.label}</p>
                      <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, theme, forceOpen = false }) => {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  return (
    <div className={`rounded-2xl ${theme.bg.card} border ${colorMap[category.color]} overflow-hidden transition-all duration-200`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-5 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold ${theme.text.primary}`}>{category.title}</h3>
            <span className={`text-xs ${theme.text.muted}`}>{category.questions.length} questions</span>
          </div>
          <p className={`text-sm ${theme.text.muted} mt-1`}>{category.description}</p>
        </div>
        {isOpen
          ? <ChevronDown className={`w-5 h-5 ${accentMap[category.color]} shrink-0`} />
          : <ChevronRight className={`w-5 h-5 ${theme.text.muted} shrink-0`} />
        }
      </button>
      {isOpen && (
        <div className={`px-5 pb-5 border-t ${theme.border.primary} space-y-2 pt-4`}>
          {category.questions.map((q, i) => (
            <QuestionItem key={i} question={q} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
};

const BehavioralPrepPage = () => {
  const { theme } = useTheme();
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-4xl mx-auto px-4">

          <Link to="/learn" className={`inline-flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mb-8`}>
            <ArrowLeft className="w-4 h-4" />
            All Courses
          </Link>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-bg)] border border-[var(--green-border)] mb-6">
              <Zap className="w-4 h-4 text-[var(--green)]" />
              <span className="text-sm font-semibold text-[var(--green)]">100% Free — No Login Required</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-4`}>{BEHAVIORAL_META.title}</h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-6`}>{BEHAVIORAL_META.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <BookOpen className="w-4 h-4 text-[#06b6d4]" />
                <span>{BEHAVIORAL_META.totalCategories} categories</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <MessageSquare className="w-4 h-4 text-[var(--purple)]" />
                <span>{BEHAVIORAL_META.totalQuestions}+ questions</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                <Clock className="w-4 h-4 text-[var(--green)]" />
                <span>Tips for every question</span>
              </div>
            </div>
          </div>

          {/* STAR Framework */}
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl p-6 md:p-8 mb-10`}>
            <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>{STAR_FRAMEWORK.title}</h2>
            <p className={`text-sm ${theme.text.secondary} mb-6`}>{STAR_FRAMEWORK.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {STAR_FRAMEWORK.steps.map((step) => (
                <div key={step.letter} className={`${theme.bg.secondary} rounded-xl p-4 text-center`}>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#06b6d4]/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#06b6d4]">{step.letter}</span>
                  </div>
                  <p className={`font-semibold text-sm ${theme.text.primary} mb-1`}>{step.label}</p>
                  <p className={`text-xs ${theme.text.muted}`}>{step.tip}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${theme.text.muted} uppercase tracking-wider mb-2`}>Pro Tips</p>
              {STAR_FRAMEWORK.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#06b6d4] shrink-0 mt-0.5" />
                  <p className={`text-sm ${theme.text.secondary}`}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setExpandAll(!expandAll)}
              className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}
            >
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          <div className="space-y-3">
            {BEHAVIORAL_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} theme={theme} forceOpen={expandAll} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={`mt-14 p-8 rounded-2xl ${theme.bg.card} border-2 border-[#06b6d4]/20 text-center`}>
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Practice with a coach</h3>
            <p className={`${theme.text.secondary} mb-6 text-sm`}>
              Book a mock behavioral interview with a MAANG engineer. Get feedback on your stories, delivery, and areas to improve.
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

export default BehavioralPrepPage;
