import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, BookOpen, Clock, Users, Zap, ChevronRight, Crown, CheckCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const COURSES = [
  {
    id: 'system-design',
    title: 'System Design',
    subtitle: 'From zero to designing systems at scale',
    description: 'Learn how to design large-scale distributed systems. Covers core concepts, real interview question breakdowns, patterns, and key technologies.',
    path: '/learn/system-design',
    topics: '50+',
    duration: '~20 hours',
    difficulty: 'Intermediate — Advanced',
    access: 'Free with login',
    tags: ['Distributed Systems', 'Databases', 'Caching', 'Load Balancing', 'Interview Questions'],
    color: 'cyan',
    featured: true,
  },
  {
    id: 'dsa-patterns',
    title: 'DSA',
    subtitle: 'Master coding interviews by learning patterns, not memorizing solutions',
    description: 'A curated list of 180+ LeetCode problems organized by 22 patterns. Solve 3-5 problems per pattern and you\'ll recognize them in any interview.',
    path: '/learn/dsa-patterns',
    topics: '180+',
    duration: 'Self-paced',
    difficulty: 'Easy — Hard',
    access: 'Free with login',
    tags: ['Two Pointers', 'Sliding Window', 'DP', 'Trees', 'Graphs', 'Backtracking'],
    color: 'green',
    featured: true,
  },
  {
    id: 'devops',
    title: 'DevOps',
    subtitle: 'CI/CD, containers, cloud, and infrastructure — from basics to production',
    description: 'A complete DevOps interview prep course covering Linux, Git, Docker, Kubernetes, CI/CD, cloud providers, monitoring, and Infrastructure as Code. Includes a 30-day MAANG-ready roadmap and real scenario-based interview questions.',
    path: '/learn/devops',
    topics: '64',
    duration: 'Self-paced',
    difficulty: 'Beginner — Advanced',
    access: 'Free with login',
    tags: ['30-Day Roadmap', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Monitoring', 'Scenario Questions'],
    color: 'orange',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview Prep',
    subtitle: 'STAR method, leadership stories, and common questions',
    description: 'Prepare for behavioral interviews with structured frameworks, example questions, and tips. Covers leadership, conflict, teamwork, Amazon LPs, and Meta values.',
    path: '/learn/behavioral',
    topics: '80+',
    duration: 'Self-paced',
    difficulty: 'All Levels',
    access: 'Free with login',
    tags: ['STAR Method', 'Leadership', 'Conflict Resolution', 'Amazon LPs', 'Meta Values'],
    color: 'purple',
  },
];

const colorMap = {
  cyan:   { border: 'border-[var(--cyan-border)] hover:border-[var(--cyan)]', badge: 'bg-[var(--cyan-bg)] text-[var(--cyan)]', tag: 'bg-[var(--cyan-bg)] text-[var(--cyan)]' },
  green:  { border: 'border-[var(--green-border)] hover:border-[var(--green)]', badge: 'bg-[var(--green-bg)] text-[var(--green)]', tag: 'bg-[var(--green-bg)] text-[var(--green)]' },
  purple: { border: 'border-[var(--purple-border)] hover:border-[var(--purple)]', badge: 'bg-[var(--purple-bg)] text-[var(--purple)]', tag: 'bg-[var(--purple-bg)] text-[var(--purple)]' },
  orange: { border: 'border-[var(--orange-border)] hover:border-[var(--orange)]', badge: 'bg-[var(--orange-bg)] text-[var(--orange)]', tag: 'bg-[var(--orange-bg)] text-[var(--orange)]' },
};

const CourseCard = ({ course, theme }) => {
  const colors = colorMap[course.color];
  const Wrapper = course.path ? Link : 'div';
  const wrapperProps = course.path ? { to: course.path } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`block rounded-2xl ${theme.bg.card} border ${colors.border} transition-all duration-300 overflow-hidden group ${course.comingSoon ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-1'}`}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-xl md:text-2xl font-bold ${theme.text.primary} ${!course.comingSoon ? 'group-hover:text-[#06b6d4]' : ''} transition-colors`}>
                {course.title}
              </h3>
              {course.comingSoon && (
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-semibold">Coming Soon</span>
              )}
            </div>
            <p className={`text-sm ${theme.text.muted}`}>{course.subtitle}</p>
          </div>
          {!course.comingSoon && (
            <ChevronRight className={`w-5 h-5 ${theme.text.muted} group-hover:text-[#06b6d4] transition-colors shrink-0 mt-1`} />
          )}
        </div>

        {/* Description */}
        <p className={`${theme.text.secondary} text-sm leading-relaxed mb-5`}>{course.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
          <div className={`flex items-center gap-1.5 ${theme.text.muted}`}>
            <BookOpen className="w-4 h-4" />
            <span>{course.topics} topics</span>
          </div>
          <div className={`flex items-center gap-1.5 ${theme.text.muted}`}>
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Access badge */}
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle className={`w-4 h-4 ${course.access.includes('Free') ? 'text-[var(--green)]' : 'text-[var(--accent)]'}`} />
          <span className={`text-sm font-medium ${course.access.includes('Free') ? 'text-[var(--green)]' : 'text-[var(--accent)]'}`}>
            {course.access}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag, i) => (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${colors.tag} font-medium`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

const CoursesLandingPage = () => {
  const { theme, isDark } = useTheme();

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main>
        {/* Hero */}
        <section className={`pt-24 pb-16 md:pt-32 md:pb-24 ${theme.bg.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 -right-1/4 w-[500px] h-[500px] ${isDark ? 'bg-cyan-900/20' : 'bg-cyan-100'} rounded-full blur-3xl opacity-50 animate-blob`} />
            <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'} rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000`} />
          </div>

          <div className="container relative z-10">
            <Link to="/mentee" className={`inline-flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mb-6`}>
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 mb-6">
                <Zap className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-sm font-semibold text-[#06b6d4]">Free Courses for Interview Prep</span>
              </div>

              <h1 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-4 leading-tight`}>
                Learn. Practice. <span className="text-[#06b6d4]">Get Hired.</span>
              </h1>

              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto mb-8`}>
                Structured courses to help you crack interviews at top product based companies. Free to start, no login required.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                  <BookOpen className="w-4 h-4 text-[#06b6d4]" />
                  <span>{COURSES.filter(c => !c.comingSoon).length} courses live</span>
                </div>
                <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                  <Users className="w-4 h-4 text-[var(--green)]" />
                  <span>Free to start</span>
                </div>
                <div className={`flex items-center gap-2 ${theme.text.muted}`}>
                  <Clock className="w-4 h-4 text-[var(--purple)]" />
                  <span>Self-paced learning</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className={`py-16 md:py-24 ${theme.bg.secondary}`}>
          <div className="container max-w-5xl mx-auto px-4">
            <div className="space-y-6">
              {COURSES.map((course) => (
                <CourseCard key={course.id} course={course} theme={theme} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className={`py-16 md:py-24 ${theme.bg.primary}`}>
          <div className="container max-w-3xl mx-auto text-center px-4">
            <h2 className={`text-3xl font-bold ${theme.text.primary} mb-4`}>
              Want personalized feedback?
            </h2>
            <p className={`${theme.text.secondary} mb-8 max-w-xl mx-auto`}>
              Book a 1-on-1 mock interview with a MAANG engineer. Get detailed feedback on your approach, communication, and areas to improve.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-300 shadow-lg text-lg"
              >
                Book a Mock Interview
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/apply"
                className={`inline-flex items-center gap-2 px-8 py-4 ${theme.button.secondary} rounded-xl transition-all duration-300`}
              >
                <Crown className="w-4 h-4 text-amber-500" />
                View Plans
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CoursesLandingPage;
