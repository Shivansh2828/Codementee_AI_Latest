import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ChevronRight, BookOpen, Lightbulb, AlertTriangle, Info, Menu, X, CheckCircle, XCircle, Code2, Layers, Zap, Lock, Crown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopicBySlug, getNextTopic, getPrevTopic, TOPICS, SECTIONS, getTopicAccess } from '../../data/systemDesignCourse';
import { ANIMATIONS } from '../../components/learn/CourseAnimations';
import { useAuth } from '../../contexts/AuthContext';

// ── Rich text renderer ───────────────────────────────────────────────────────
const RichText = ({ text }) => {
  if (!text) return null;
  // Split on code fences first
  const fenceParts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {fenceParts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, ''); // strip language hint
          return (
            <pre key={i} className="bg-gray-950 rounded-xl p-4 text-sm text-green-300 font-mono overflow-x-auto my-4 border border-gray-800 leading-relaxed">
              {code.trim()}
            </pre>
          );
        }
        // Inline bold + newlines
        const lines = part.split('\n');
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <span key={li}>
                  {boldParts.map((bp, bi) =>
                    bp.startsWith('**') && bp.endsWith('**')
                      ? <strong key={bi} className="text-white font-semibold">{bp.slice(2, -2)}</strong>
                      : <span key={bi}>{bp}</span>
                  )}
                  {li < lines.length - 1 && <br />}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
};

const calloutStyles = {
  tip:     { bg: 'bg-green-500/10 border-green-500/30',  label: '💡 Tip',       labelColor: 'text-green-400' },
  warning: { bg: 'bg-yellow-500/10 border-yellow-500/30', label: '⚠️ Watch Out', labelColor: 'text-yellow-400' },
  info:    { bg: 'bg-blue-500/10 border-blue-500/30',    label: 'ℹ️ Note',      labelColor: 'text-blue-400' },
  example: { bg: 'bg-purple-500/10 border-purple-500/30', label: '📌 Example',   labelColor: 'text-purple-400' },
};

// ── Section renderer ─────────────────────────────────────────────────────────
const Section = ({ section, theme }) => {
  switch (section.type) {

    case 'text':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className={`${theme.text.secondary} leading-relaxed whitespace-pre-line text-base`}>
            <RichText text={section.body} />
          </div>
        </div>
      );

    case 'requirements':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.functional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400 text-sm">Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.functional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} />
                    </div>
                  ))}
                </div>
                {section.functionalOutOfScope && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.functionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0 text-gray-600" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section.nonFunctional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-400 text-sm">Non-Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.nonFunctional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} />
                    </div>
                  ))}
                </div>
                {section.nonFunctionalOutOfScope && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.nonFunctionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0 text-gray-600" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'api':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-3">
            {section.endpoints.map((ep, i) => (
              <div key={i} className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                    ep.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    ep.method === 'PUT' || ep.method === 'PATCH' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{ep.method}</span>
                  <code className="text-cyan-300 text-sm font-mono">{ep.path}</code>
                  {ep.label && <span className={`ml-auto text-xs ${theme.text.muted}`}>{ep.label}</span>}
                </div>
                {(ep.request || ep.response) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ep.request && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Request</p>
                        <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">{ep.request}</pre>
                      </div>
                    )}
                    {ep.response && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Response</p>
                        <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">{ep.response}</pre>
                      </div>
                    )}
                  </div>
                )}
                {ep.note && <p className={`px-4 pb-3 text-xs ${theme.text.muted} italic`}>{ep.note}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'schema':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-4">
            {section.entities.map((entity, i) => (
              <div key={i} className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
                <div className={`flex items-center gap-2 px-4 py-3 border-b border-gray-800`}>
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-semibold text-sm font-mono">{entity.name}</span>
                  {entity.note && <span className={`ml-auto text-xs ${theme.text.muted}`}>{entity.note}</span>}
                </div>
                <div className="p-4">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left pb-2 pr-4">Field</th>
                        <th className="text-left pb-2 pr-4">Type</th>
                        <th className="text-left pb-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.fields.map((field, fi) => (
                        <tr key={fi} className="border-b border-gray-900">
                          <td className="py-1.5 pr-4 text-cyan-300">{field.name}</td>
                          <td className="py-1.5 pr-4 text-yellow-300">{field.type}</td>
                          <td className={`py-1.5 ${theme.text.muted}`}>{field.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'deepdive':
      return (
        <div className="mb-8">
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
            <div className="px-6 py-4 bg-gradient-to-r from-[#06b6d4]/10 to-transparent border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#06b6d4]" />
                <h2 className={`text-lg font-bold ${theme.text.primary}`}>{section.heading}</h2>
              </div>
              {section.subtitle && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.subtitle}</p>}
            </div>
            <div className="p-6 space-y-6">
              {section.content.map((sub, i) => (
                <Section key={i} section={sub} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'levels':
      const levelColors = { 'Mid-level': 'blue', 'Senior': 'purple', 'Staff+': 'orange' };
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="space-y-4">
            {section.levels.map((level, i) => {
              const color = levelColors[level.title] || 'cyan';
              return (
                <div key={i} className={`${theme.bg.card} border border-${color}-500/20 rounded-xl p-5`}>
                  <h3 className={`font-bold text-${color}-400 mb-3`}>{level.title}</h3>
                  <div className={`${theme.text.secondary} text-sm leading-relaxed whitespace-pre-line`}>
                    <RichText text={level.body} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'animation':
      const AnimComponent = ANIMATIONS[section.id];
      return (
        <div className={`mb-8 rounded-2xl ${theme.bg.card} ${theme.border.primary} border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${theme.border.primary}`}>
            <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
            {section.body && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.body}</p>}
          </div>
          <div className="p-6 bg-gray-900/50">
            {AnimComponent ? <AnimComponent /> : <div className="text-center text-gray-500 py-8">Animation loading...</div>}
          </div>
        </div>
      );

    case 'callout':
      const style = calloutStyles[section.variant] || calloutStyles.info;
      return (
        <div className={`mb-8 p-5 rounded-xl border ${style.bg}`}>
          <p className={`font-semibold mb-2 ${style.labelColor}`}>{style.label}: {section.heading}</p>
          <div className={`${theme.text.secondary} text-sm leading-relaxed`}>
            <RichText text={section.body} />
          </div>
        </div>
      );

    default:
      return null;
  }
};

const SystemDesignLesson = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic = getTopicBySlug(slug);
  const next = getNextTopic(slug);
  const prev = getPrevTopic(slug);
  const allSlugs = SECTIONS.flatMap(s => s.topics);
  const currentIndex = allSlugs.indexOf(slug);
  const access = getTopicAccess(slug, user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!topic) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${theme.text.primary} text-xl mb-4`}>Lesson not found</p>
          <Link to="/learn/system-design" className="text-[#06b6d4] hover:underline">← Back to course</Link>
        </div>
      </div>
    );
  }

  // Locked — show upgrade prompt
  if (access === 'locked') {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>{topic.title}</h1>
            <p className={`${theme.text.secondary} mb-6`}>
              This lesson requires a paid plan. Upgrade to unlock all system design content.
            </p>
            <div className="space-y-3">
              <Link
                to="/apply"
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-center"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Get Elite — Full Access
              </Link>
              <Link
                to="/apply"
                className={`block w-full px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium text-center hover:border-blue-500/50 transition-all`}
              >
                Get Pro — Partial Access
              </Link>
              <Link
                to="/learn/system-design"
                className={`block text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mt-4`}
              >
                ← Back to course
              </Link>
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
      <div className="pt-20 flex">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-gray-800 bg-gray-950/50">
          <div className="p-4 border-b border-gray-800">
            <Link to="/learn/system-design" className={`flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" />
              System Design
            </Link>
          </div>
          <nav className="p-3 space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5`}>
                  <span>{section.title}</span>
                </div>
                {section.topics.map((topicSlug) => {
                  const t = TOPICS[topicSlug];
                  if (!t) return null;
                  const topicAccess = getTopicAccess(topicSlug, user);
                  const isTopicLocked = topicAccess === 'locked';
                  if (isTopicLocked) {
                    return (
                      <div key={topicSlug} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed">
                        
                        <span className="truncate">{t.title}</span>
                        <Lock className="w-3 h-3 ml-auto shrink-0" />
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={topicSlug}
                      to={`/learn/system-design/${topicSlug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        topicSlug === slug
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium'
                          : `${theme.text.secondary} hover:bg-gray-800`
                      }`}
                    >
                      
                      <span className="truncate">{t.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link to="/learn/system-design" className={`text-sm ${theme.text.muted}`}>System Design</Link>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <nav className="p-3 space-y-4">
                {SECTIONS.map((section) => (
                  <div key={section.id}>
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <span>{section.title}</span>
                    </div>
                    {section.topics.map((topicSlug) => {
                      const t = TOPICS[topicSlug];
                      if (!t) return null;
                      const topicAccess = getTopicAccess(topicSlug, user);
                      if (topicAccess === 'locked') {
                        return (
                          <div key={topicSlug} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed">
                            
                            <span className="truncate">{t.title}</span>
                            <Lock className="w-3 h-3 ml-auto shrink-0" />
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={topicSlug}
                          to={`/learn/system-design/${topicSlug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            topicSlug === slug ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium' : `${theme.text.secondary} hover:bg-gray-800`
                          }`}
                        >
                          
                          <span className="truncate">{t.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-10">

            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-lg ${theme.bg.card} border ${theme.border.primary}`}>
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              <div className={`text-sm ${theme.text.muted}`}>
                {currentIndex + 1} / {allSlugs.length}
              </div>
            </div>

            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-sm ${theme.text.muted} mb-6`}>
              <Link to="/learn/system-design" className="hover:text-[#06b6d4] transition-colors">System Design</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#06b6d4]">{topic.title}</span>
            </div>

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl"></span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    topic.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{topic.difficulty}</span>
                  <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                    <Clock className="w-3.5 h-3.5" />{topic.duration}
                  </span>
                </div>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-2`}>{topic.title}</h1>
              <p className={`text-lg ${theme.text.secondary}`}>{topic.subtitle}</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-[#06b6d4]/50 to-transparent mb-10" />

            {/* Sections */}
            {topic.sections.map((section, i) => (
              <Section key={i} section={section} theme={theme} />
            ))}

            {/* Preview upgrade banner */}
            {access === 'preview' && (
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>You're viewing a free preview</h3>
                <p className={`${theme.text.secondary} text-sm mb-4 max-w-md mx-auto`}>
                  Upgrade to unlock all topics, question breakdowns, patterns, and technologies.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/apply" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all">
                    <Crown className="w-4 h-4" />
                    Get Elite — Full Access
                  </Link>
                  <Link to="/apply" className={`inline-flex items-center gap-2 px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium hover:border-blue-500/50 transition-all`}>
                    Get Pro — Partial Access
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-14 pt-8 border-t ${theme.border.primary}`}>
              {prev ? (
                <Link
                  to={`/learn/system-design/${prev.slug}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl ${theme.bg.card} border ${theme.border.primary} hover:border-[#06b6d4]/50 transition-all group`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#06b6d4]" />
                  <div className="text-left">
                    <p className={`text-xs ${theme.text.muted}`}>Previous</p>
                    <p className={`text-sm font-medium ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}>{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  to={`/learn/system-design/${next.slug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all group"
                >
                  <div className="text-right">
                    <p className="text-xs opacity-80">Next</p>
                    <p className="text-sm font-medium">{next.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/learn/system-design"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Course Complete!</span>
                </Link>
              )}
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SystemDesignLesson;
