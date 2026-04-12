import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ArrowRight, FileText, Search, Target } from 'lucide-react';

const practiceCategories = [
  {
    icon: FileText,
    title: 'Interview Prep',
    description: 'AI-powered interview preparation with company-specific questions, tips, and practice scenarios.',
    href: '/mentee/interview-prep',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Search,
    title: 'Resume Analyzer',
    description: 'Get your resume reviewed with ATS optimization, keyword analysis, and actionable improvement suggestions.',
    href: '/mentee/resume-analyzer',
    color: 'from-purple-400 to-pink-500',
  },
];

const PracticePage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className={`py-20 md:py-28 ${theme.bg.gradient} relative overflow-hidden`}>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Target className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Practice</span>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary} leading-tight`}>
              Sharpen Your <span className="text-[#06b6d4]">Skills</span>
            </h1>
            <p className={`text-lg ${theme.text.secondary} mb-10 max-w-2xl mx-auto`}>
              Tools to help you prepare smarter — from AI-driven interview prep to resume analysis.
            </p>
          </div>
        </section>

        {/* Practice Categories */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Practice <span className="text-[#06b6d4]">Tools</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Pick a tool and start practicing. More coming soon.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {practiceCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.title}
                    to={cat.href}
                    className={`${theme.glass} rounded-2xl p-8 border ${theme.border.primary} hover:border-[#06b6d4]/40 ${theme.shadow} transition-all duration-300 hover:-translate-y-1 group block`}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center shadow-lg mb-5`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${theme.text.primary} mb-3`}>{cat.title}</h3>
                    <p className={`text-sm ${theme.text.secondary} leading-relaxed mb-4`}>{cat.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#06b6d4] group-hover:gap-2 transition-all duration-200">
                      Get Started <ArrowRight size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PracticePage;
