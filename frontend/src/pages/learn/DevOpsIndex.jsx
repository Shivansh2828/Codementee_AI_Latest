import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, BookOpen, Zap, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { DEVOPS_SECTIONS, DEVOPS_TOPICS, DEVOPS_META } from '../../data/devopsCourse';

const difficultyColor = {
  Beginner: 'text-[var(--green)]',
  Intermediate: 'text-[var(--yellow)]',
  Advanced: 'text-[var(--red)]',
};

const sectionBorderColor = {
  cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
  blue: 'border-blue-500/30 hover:border-blue-500/60',
  purple: 'border-purple-500/30 hover:border-purple-500/60',
  green: 'border-green-500/30 hover:border-green-500/60',
  orange: 'border-orange-500/30 hover:border-orange-500/60',
  red: 'border-red-500/30 hover:border-red-500/60',
  pink: 'border-pink-500/30 hover:border-pink-500/60',
};

const sectionBadgeColor = {
  cyan: 'bg-[var(--cyan-bg)] text-[var(--cyan)]',
  blue: 'bg-[var(--blue-bg)] text-[var(--blue)]',
  purple: 'bg-[var(--purple-bg)] text-[var(--purple)]',
  green: 'bg-[var(--green-bg)] text-[var(--green)]',
  orange: 'bg-[var(--orange-bg)] text-[var(--orange)]',
  red: 'bg-[var(--red-bg)] text-[var(--red)]',
  pink: 'bg-[var(--pink-bg)] text-[var(--pink)]',
};

const DevOpsIndex = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const firstSlug = DEVOPS_SECTIONS[0]?.topics[0];

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-5xl mx-auto px-4">

          {/* Breadcrumb */}
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
              {DEVOPS_META.title}
            </h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-8`}>
              {DEVOPS_META.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-8">
              {[
                { icon: BookOpen, text: `${DEVOPS_META.totalTopics} topics` },
                { icon: Clock, text: 'Self-paced' },
                { icon: Users, text: 'Free with login' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 ${theme.text.muted}`}>
                  <item.icon className="w-4 h-4 text-[#06b6d4]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Link
              to={`/learn/devops/${firstSlug}`}
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
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Sign in to access DevOps content</h3>
            <p className={`${theme.text.secondary} mb-6 text-sm max-w-lg mx-auto`}>All DevOps content is free for logged-in users. Create an account or sign in to get full access.</p>
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
            {DEVOPS_SECTIONS.map((section) => (
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
                  {section.topics.map((slug) => {
                    const topic = DEVOPS_TOPICS[slug];
                    if (!topic) return null;
                    return (
                      <Link
                        key={slug}
                        to={`/learn/devops/${slug}`}
                        className={`flex items-start gap-3 p-4 rounded-xl ${theme.bg.card} border ${sectionBorderColor[section.color]} transition-all duration-200 group`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">📘</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors truncate`}>
                            {topic.title}
                          </p>
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
      </main>
      <Footer />
    </div>
  );
};

export default DevOpsIndex;
