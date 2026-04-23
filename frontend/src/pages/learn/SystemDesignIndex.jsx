import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, BookOpen, Zap, Users, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SECTIONS, TOPICS, COURSE_META } from '../../data/systemDesignCourse';
import { INTERVIEW_FAQ } from '../../data/courses/interviewFAQ';

const difficultyColor = {
  Beginner: 'text-[var(--green)]',
  Easy: 'text-[var(--green)]',
  Intermediate: 'text-[var(--yellow)]',
  Medium: 'text-[var(--yellow)]',
  Advanced: 'text-[var(--red)]',
  Hard: 'text-[var(--red)]',
};

const difficultyOrder = { Beginner: 0, Easy: 0, Intermediate: 1, Medium: 1, Advanced: 2, Hard: 2 };
const sortByDifficulty = (slugs, topics) =>
  [...slugs].sort((a, b) => (difficultyOrder[topics[a]?.difficulty] ?? 1) - (difficultyOrder[topics[b]?.difficulty] ?? 1));

const sectionBorderColor = {
  cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
  blue: 'border-blue-500/30 hover:border-blue-500/60',
  purple: 'border-purple-500/30 hover:border-purple-500/60',
  green: 'border-green-500/30 hover:border-green-500/60',
  orange: 'border-orange-500/30 hover:border-orange-500/60',
  red: 'border-red-500/30 hover:border-red-500/60',
};

const sectionBadgeColor = {
  cyan: 'bg-[var(--cyan-bg)] text-[var(--cyan)]',
  blue: 'bg-[var(--blue-bg)] text-[var(--blue)]',
  purple: 'bg-[var(--purple-bg)] text-[var(--purple)]',
  green: 'bg-[var(--green-bg)] text-[var(--green)]',
  orange: 'bg-[var(--orange-bg)] text-[var(--orange)]',
  red: 'bg-[var(--red-bg)] text-[var(--red)]',
};

const SystemDesignIndex = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const firstSlug = SECTIONS[0]?.topics[0];

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-5xl mx-auto px-4">

          {/* Back to Courses */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/mentee" className={`inline-flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className={`text-sm ${theme.text.muted}`}>/</span>
            <Link to="/learn" className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              All Courses
            </Link>
          </div>

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 mb-6">
              <Zap className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Free for all logged-in users</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-4 leading-tight`}>
              {COURSE_META.title}
            </h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-8`}>
              {COURSE_META.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-8">
              {[
                { icon: BookOpen, text: `${COURSE_META.totalTopics}+ topics` },
                { icon: Clock, text: `~${COURSE_META.estimatedHours} hours` },
                { icon: Users, text: 'Free with login' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 ${theme.text.muted}`}>
                  <item.icon className="w-4 h-4 text-[#06b6d4]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Link
              to={`/learn/system-design/${firstSlug}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-300 shadow-lg text-lg"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Login gate — show sign in CTA if not logged in, sections if logged in */}
          {!user ? (
          <div className={`p-8 rounded-2xl ${theme.bg.card} border-2 border-[#06b6d4]/20 text-center`}>
            <Zap className="w-8 h-8 text-[#06b6d4] mx-auto mb-3" />
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Sign in to access System Design content</h3>
            <p className={`${theme.text.secondary} mb-6 text-sm max-w-lg mx-auto`}>All System Design content is free for logged-in users. Create an account or sign in to get full access to 50+ topics.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200">
                Sign In <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className={`inline-flex items-center gap-2 px-6 py-3 ${theme.button.secondary} rounded-xl transition-all duration-200`}>
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          ) : (
          <>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-xl font-bold ${theme.text.primary}`}>{section.title}</h2>
                    <p className={`text-sm ${theme.text.muted}`}>{section.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${sectionBadgeColor[section.color]}`}>
                    {section.topics.length} topics
                  </span>
                </div>

                {/* Topics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortByDifficulty(section.topics, TOPICS).map((slug) => {
                    const topic = TOPICS[slug];
                    if (!topic) return null;
                    return (
                      <Link
                        key={slug}
                        to={`/learn/system-design/${slug}`}
                        className={`flex items-start gap-3 p-4 rounded-xl ${theme.bg.card} border ${sectionBorderColor[section.color]} transition-all duration-200 group`}
                      >
                        <span className="text-xl shrink-0 mt-0.5"></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`font-medium text-sm ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors truncate`}>
                              {topic.title}
                            </p>
                            {topic.comingSoon && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-semibold shrink-0">Coming Soon</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${difficultyColor[topic.difficulty]}`}>{topic.difficulty}</span>
                            <span className={`text-xs ${theme.text.muted}`}>· {topic.duration}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${theme.text.muted} group-hover:text-[#06b6d4] transition-colors shrink-0 mt-1`} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </>
          )}

        </div>

        {/* Interview FAQ */}
        <div className="container max-w-4xl mx-auto px-4 mt-20 pb-20">
          <div className={`border-t ${theme.border.primary} mb-12`} />
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-6 h-6 text-[var(--accent)]" />
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Interview FAQ</h2>
          </div>
          <div className="space-y-3">
            {INTERVIEW_FAQ.map((faq, i) => (
              <details key={i} className={`group ${theme.bg.card} border ${theme.border.primary} rounded-xl overflow-hidden`}>
                <summary className={`flex items-center justify-between px-5 py-4 cursor-pointer ${theme.text.primary} font-medium text-sm hover:bg-[var(--bg-secondary)] transition-colors list-none`}>
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className={`px-5 pb-4 ${theme.text.secondary} text-sm leading-relaxed`}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SystemDesignIndex;
