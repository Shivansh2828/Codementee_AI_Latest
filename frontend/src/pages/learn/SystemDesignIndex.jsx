import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, BookOpen, Zap, Users, ArrowRight, Lock, Crown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SECTIONS, TOPICS, COURSE_META, getTopicAccess } from '../../data/systemDesignCourse';

const difficultyColor = {
  Beginner: 'text-green-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
};

const sectionBorderColor = {
  cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
  blue: 'border-blue-500/30 hover:border-blue-500/60',
  purple: 'border-purple-500/30 hover:border-purple-500/60',
  green: 'border-green-500/30 hover:border-green-500/60',
  orange: 'border-orange-500/30 hover:border-orange-500/60',
  red: 'border-red-500/30 hover:border-red-500/60',
};

const sectionBadgeColor = {
  cyan: 'bg-cyan-500/10 text-cyan-400',
  blue: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  green: 'bg-green-500/10 text-green-400',
  orange: 'bg-orange-500/10 text-orange-400',
  red: 'bg-red-500/10 text-red-400',
};

const accessBadgeMap = {
  free: null,
  pro: { label: 'Pro', color: 'bg-blue-500/20 text-blue-400' },
  elite: { label: 'Elite', color: 'bg-purple-500/20 text-purple-400' },
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

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 mb-6">
              <Zap className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Free preview available — Full access with Elite Plan</span>
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
                { icon: Users, text: 'Free preview + full access with plans' },
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

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((section) => {
              const accessBadge = accessBadgeMap[section.access];
              return (
                <div key={section.id}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className={`text-xl font-bold ${theme.text.primary}`}>{section.title}</h2>
                        {accessBadge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${accessBadge.color}`}>
                            {accessBadge.label}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${theme.text.muted}`}>{section.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sectionBadgeColor[section.color]}`}>
                      {section.topics.length} topics
                    </span>
                  </div>

                  {/* Topics grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.topics.map((slug) => {
                      const topic = TOPICS[slug];
                      if (!topic) return null;
                      const access = getTopicAccess(slug, user);
                      const isLocked = access === 'locked';

                      if (isLocked) {
                        return (
                          <div
                            key={slug}
                            className={`flex items-start gap-3 p-4 rounded-xl ${theme.bg.card} border border-gray-700/50 opacity-60 cursor-not-allowed`}
                          >
                            
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${theme.text.muted} truncate`}>{topic.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs ${difficultyColor[topic.difficulty]} opacity-50`}>{topic.difficulty}</span>
                                <span className={`text-xs ${theme.text.muted}`}>· {topic.duration}</span>
                              </div>
                            </div>
                            <Lock className="w-4 h-4 text-gray-600 shrink-0 mt-1" />
                          </div>
                        );
                      }

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
                              {access === 'preview' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold shrink-0">Preview</span>
                              )}
                              {topic.comingSoon && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 font-semibold shrink-0">Coming Soon</span>
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
              );
            })}
          </div>

          {/* Bottom CTA — hide for elite users */}
          {user?.plan_id !== 'elite' && (
          <div className={`mt-14 p-8 rounded-2xl ${theme.bg.card} border-2 border-amber-500/20 text-center`}>
            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
              Unlock the full course
            </h3>
            <p className={`${theme.text.secondary} mb-6 text-sm max-w-lg mx-auto`}>
              Elite plan members get full access to all 50+ topics, question breakdowns, patterns, and technologies. Pro plan members get access to core concepts and select breakdowns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
              >
                <Crown className="w-4 h-4" />
                Get Elite Access
              </Link>
              <Link
                to="/register"
                className={`inline-flex items-center gap-2 px-6 py-3 ${theme.button.secondary} rounded-xl transition-all duration-200`}
              >
                Book a Mock Interview
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SystemDesignIndex;
