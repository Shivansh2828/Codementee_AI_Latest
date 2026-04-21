import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ChevronRight, ChevronDown, BookOpen, Menu, X, Lock } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTopicBySlug, getNextTopic, getPrevTopic, DEVOPS_TOPICS, DEVOPS_SECTIONS } from '../../data/devopsCourse';
import ArchitectureDiagram from '../../components/learn/ArchitectureDiagram';

// ── Rich text renderer (matches SystemDesignLesson) ──────────────────────────
const RichText = ({ text, theme }) => {
  if (!text) return null;
  const fenceParts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {fenceParts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, '');
          return (
            <pre key={i} className="bg-[var(--code-bg)] text-[var(--code-text)] rounded-xl p-4 text-sm font-mono overflow-x-auto my-4 border border-[var(--border-primary)] leading-relaxed">
              {code.trim()}
            </pre>
          );
        }
        const lines = part.split('\n');
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const tokens = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
              return (
                <span key={li}>
                  {tokens.map((tok, ti) => {
                    if (tok.startsWith('**') && tok.endsWith('**')) {
                      return <strong key={ti} className={`${theme.text.primary} font-semibold`}>{tok.slice(2, -2)}</strong>;
                    }
                    const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                      const isExternal = linkMatch[2].startsWith('http');
                      return <a key={ti} href={linkMatch[2]} className="text-blue-500 hover:text-blue-400 hover:underline" {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{linkMatch[1]}</a>;
                    }
                    return <span key={ti}>{tok}</span>;
                  })}
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

// ── Color helper ─────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:   { text: 'text-[var(--blue)]',   bg: 'bg-[var(--blue-bg)]',   border: 'border-[var(--blue-border)]' },
  green:  { text: 'text-[var(--green)]',  bg: 'bg-[var(--green-bg)]',  border: 'border-[var(--green-border)]' },
  red:    { text: 'text-[var(--red)]',    bg: 'bg-[var(--red-bg)]',    border: 'border-[var(--red-border)]' },
  yellow: { text: 'text-[var(--yellow)]', bg: 'bg-[var(--yellow-bg)]', border: 'border-[var(--yellow-border)]' },
  purple: { text: 'text-[var(--purple)]', bg: 'bg-[var(--purple-bg)]', border: 'border-[var(--purple-border)]' },
  cyan:   { text: 'text-[var(--cyan)]',   bg: 'bg-[var(--cyan-bg)]',   border: 'border-[var(--cyan-border)]' },
  orange: { text: 'text-[var(--orange)]', bg: 'bg-[var(--orange-bg)]', border: 'border-[var(--orange-border)]' },
  pink:   { text: 'text-[var(--pink)]',   bg: 'bg-[var(--pink-bg)]',   border: 'border-[var(--pink-border)]' },
};
const c = (color) => COLOR_MAP[color] || COLOR_MAP.blue;

const calloutStyles = {
  tip:     { bg: 'bg-[var(--success-bg)] border-[var(--success-border)]', label: '💡 Tip',       labelColor: 'text-[var(--success)]' },
  warning: { bg: 'bg-[var(--warning-bg)] border-[var(--warning-border)]', label: '⚠️ Watch Out', labelColor: 'text-[var(--warning)]' },
  info:    { bg: 'bg-[var(--info-bg)] border-[var(--info-border)]',       label: 'ℹ️ Note',      labelColor: 'text-[var(--info)]' },
  example: { bg: 'bg-[var(--purple-bg)] border-[var(--purple-border)]',   label: '📌 Example',   labelColor: 'text-[var(--purple)]' },
};

// ── Data-driven diagram: flow (step-by-step process) ─────────────────────────
const FlowDiagram = ({ steps, theme }) => (
  <div className="flex flex-col gap-3 max-w-lg mx-auto">
    {steps.map((s, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${c(s.color || 'blue').bg} border ${c(s.color || 'blue').border} flex items-center justify-center shrink-0`}>
          <span className={`text-xs font-bold ${c(s.color || 'blue').text}`}>{i + 1}</span>
        </div>
        <div className="flex-1">
          <span className={`text-sm font-semibold ${c(s.color || 'blue').text}`}>{s.label}</span>
          <span className={`text-sm ${theme.text.secondary} ml-2`}>{s.desc}</span>
        </div>
        {i < steps.length - 1 && <div className={`text-xs ${theme.text.muted}`}>↓</div>}
      </div>
    ))}
  </div>
);

// ── Data-driven diagram: comparison (side-by-side boxes) ─────────────────────
const ComparisonDiagram = ({ items, theme }) => (
  <div className={`grid grid-cols-1 ${items.length <= 3 ? 'md:grid-cols-' + items.length : 'md:grid-cols-3'} gap-4 max-w-3xl mx-auto`}>
    {items.map((item, i) => (
      <div key={i} className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
        <h4 className={`font-bold ${c(item.color || 'blue').text} text-center mb-3`}>{item.title}</h4>
        <div className={`space-y-2 text-xs ${theme.text.secondary}`}>
          {item.points.map((p, j) => <p key={j}>{p}</p>)}
        </div>
      </div>
    ))}
  </div>
);

// ── Data-driven diagram: layers (stacked boxes) ──────────────────────────────
const LayersDiagram = ({ layers, theme }) => (
  <div className="flex flex-col items-center gap-1.5 max-w-md mx-auto">
    {layers.map((l, i) => (
      <div key={i} className={`w-full border rounded-lg px-4 py-2.5 flex items-center justify-between ${
        l.color
          ? `${c(l.color).bg} ${c(l.color).border} ${c(l.color).text} ${l.highlight ? 'ring-1 ring-offset-1 ring-offset-transparent' : ''}`
          : `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}`
      }`} style={l.width ? { maxWidth: l.width } : {}}>
        <span className="text-sm font-bold">{l.label}</span>
        {l.detail && <span className="text-xs opacity-70">{l.detail}</span>}
      </div>
    ))}
  </div>
);

// ── Section renderer (matches SystemDesignLesson styles) ─────────────────────
const Section = ({ section, theme }) => {
  switch (section.type) {
    case 'faq':
      return (
        <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
          <div className="px-6 py-4 border-b border-[var(--border-primary)]">
            <h2 className={`text-lg font-bold ${theme.text.primary}`}>❓ {section.heading || 'Frequently Asked Questions'}</h2>
          </div>
          <div className="divide-y divide-[var(--border-primary)]">
            {section.questions?.map((faq, i) => (
              <details key={i} className="group">
                <summary className={`flex items-center justify-between px-6 py-4 cursor-pointer ${theme.text.primary} font-medium text-sm hover:bg-[var(--bg-secondary)] transition-colors list-none`}>
                  <span>{faq.q}</span>
                  <span className="text-[var(--text-muted)] text-xs group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className={`px-6 pb-4 ${theme.text.secondary} text-sm leading-relaxed`}>
                  <RichText text={faq.a} theme={theme} />
                </div>
              </details>
            ))}
          </div>
        </div>
      );

    case 'callout': {
      const style = calloutStyles[section.variant] || calloutStyles.info;
      return (
        <div className={`mb-8 p-5 rounded-xl border ${style.bg}`}>
          <p className={`font-semibold mb-2 ${style.labelColor}`}>{style.label}: {section.heading}</p>
          <div className={`${theme.text.secondary} text-sm leading-relaxed`}>
            <RichText text={section.body} theme={theme} />
          </div>
        </div>
      );
    }

    case 'diagram':
      return (
        <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
          {section.heading && (
            <div className={`px-6 py-3 border-b ${theme.border.primary}`}>
              <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
              {section.caption && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.caption}</p>}
            </div>
          )}
          <div className="p-6">
            {section.variant === 'flow' && section.steps && <FlowDiagram steps={section.steps} theme={theme} />}
            {section.variant === 'comparison' && section.items && <ComparisonDiagram items={section.items} theme={theme} />}
            {section.variant === 'layers' && section.layers && <LayersDiagram layers={section.layers} theme={theme} />}
          </div>
        </div>
      );

    case 'architecture':
      return <ArchitectureDiagram {...section.config} title={section.heading} caption={section.caption} />;

    default:
      // text section
      return (
        <div className="mb-8">
          {section.heading && (
            <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>
          )}
          {section.body && (
            <div className={`${theme.text.secondary} leading-relaxed whitespace-pre-line text-base`}>
              <RichText text={section.body} theme={theme} />
            </div>
          )}
        </div>
      );
  }
};

// ── Main Lesson Component (layout matches SystemDesignLesson) ────────────────
const DevOpsLesson = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic = getTopicBySlug(slug);
  const next = getNextTopic(slug);
  const prev = getPrevTopic(slug);
  const allSlugs = DEVOPS_SECTIONS.flatMap(s => s.topics);
  const currentIndex = allSlugs.indexOf(slug);

  // Track which sidebar sections are expanded — auto-expand the section containing the current topic
  const currentSectionId = DEVOPS_SECTIONS.find(s => s.topics.includes(slug))?.id;
  const [expandedSections, setExpandedSections] = useState(() => {
    return currentSectionId ? { [currentSectionId]: true } : {};
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Auto-expand the section when navigating to a new topic
  useEffect(() => {
    if (currentSectionId) {
      setExpandedSections(prev => ({ ...prev, [currentSectionId]: true }));
    }
  }, [currentSectionId]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!topic) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${theme.text.primary} text-xl mb-4`}>Lesson not found</p>
          <Link to="/learn/devops" className="text-[#06b6d4] hover:underline">← Back to course</Link>
        </div>
      </div>
    );
  }

  // Not logged in — show login prompt
  if (!user) {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-[#06b6d4]" />
            </div>
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>{topic.title}</h1>
            <p className={`${theme.text.secondary} mb-6`}>
              Sign in to access all DevOps content for free.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all text-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`block w-full px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium text-center hover:border-[#06b6d4]/50 transition-all`}
              >
                Create Account
              </Link>
              <Link
                to="/learn/devops"
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
        <aside className={`hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r ${theme.border.primary} ${theme.bg.card}`}>
          <div className={`p-4 border-b ${theme.border.primary}`}>
            <Link to="/learn/devops" className={`flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" />
              DevOps
            </Link>
          </div>
          <nav className="p-3 space-y-1">
            {DEVOPS_SECTIONS.map((section) => {
              const isExpanded = expandedSections[section.id];
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} hover:text-[#06b6d4] transition-colors rounded-lg ${theme.bg.hover}`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  {isExpanded && section.topics.map((topicSlug) => {
                    const t = DEVOPS_TOPICS[topicSlug];
                    if (!t) return null;
                    return (
                      <Link
                        key={topicSlug}
                        to={`/learn/devops/${topicSlug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          topicSlug === slug
                            ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium'
                            : `${theme.text.secondary} ${theme.bg.hover}`
                        }`}
                      >
                        <span className="truncate">{t.title}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className={`w-72 ${theme.bg.card} border-r ${theme.border.primary} flex flex-col overflow-y-auto`}>
              <div className={`p-4 border-b ${theme.border.primary} flex items-center justify-between`}>
                <Link to="/learn/devops" className={`text-sm ${theme.text.muted}`}>DevOps</Link>
                <button onClick={() => setSidebarOpen(false)}><X className={`w-5 h-5 ${theme.text.secondary}`} /></button>
              </div>
              <nav className="p-3 space-y-1">
                {DEVOPS_SECTIONS.map((section) => {
                  const isExpanded = expandedSections[section.id];
                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} hover:text-[#06b6d4] transition-colors rounded-lg ${theme.bg.hover}`}
                      >
                        <span className="truncate">{section.title}</span>
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {isExpanded && section.topics.map((topicSlug) => {
                        const t = DEVOPS_TOPICS[topicSlug];
                        if (!t) return null;
                        return (
                          <Link
                            key={topicSlug}
                            to={`/learn/devops/${topicSlug}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                              topicSlug === slug ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium' : `${theme.text.secondary} ${theme.bg.hover}`
                            }`}
                          >
                            <span className="truncate">{t.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
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
                <Menu className={`w-5 h-5 ${theme.text.secondary}`} />
              </button>
              <div className={`text-sm ${theme.text.muted}`}>
                {currentIndex + 1} / {allSlugs.length}
              </div>
            </div>

            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-sm ${theme.text.muted} mb-6`}>
              <Link to="/learn/devops" className="hover:text-[#06b6d4] transition-colors">DevOps</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#06b6d4]">{topic.title}</span>
            </div>

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
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
            {topic.sections?.map((section, i) => (
              <Section key={i} section={section} theme={theme} />
            ))}

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-14 pt-8 border-t ${theme.border.primary}`}>
              {prev ? (
                <Link
                  to={`/learn/devops/${prev.slug}`}
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
                  to={`/learn/devops/${next.slug}`}
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
                  to="/learn/devops"
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

export default DevOpsLesson;
