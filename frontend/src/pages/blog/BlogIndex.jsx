import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { ARTICLES } from '../../data/blogArticles';
import useSEO from '../../hooks/useSEO';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

const categoryColors = {
  'Interview Prep': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'System Design': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'DevOps': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Career': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const BlogIndex = () => {
  const { theme } = useTheme();

  useSEO({
    title: 'Blog — MAANG Interview Prep Tips & Guides | Codementee',
    description: 'Expert guides on cracking MAANG interviews, system design, DevOps, and software engineering careers in India. Written by engineers from Google, Amazon, and Meta.',
    canonical: 'https://codementee.io/blog',
    keywords: 'MAANG interview blog, system design guide, DevOps interview tips, software engineer career India',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Codementee Blog',
      url: 'https://codementee.io/blog',
      description: 'Expert guides on cracking MAANG interviews and software engineering careers.',
      publisher: { '@type': 'Organization', name: 'Codementee', url: 'https://codementee.io' },
    },
  });

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Interview Prep Resources
            </div>
            <h1 className={`text-4xl font-bold ${theme.text.primary} mb-4`}>
              Guides & Articles
            </h1>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
              Practical advice on cracking MAANG interviews, system design, DevOps, and building a software engineering career in India.
            </p>
          </div>

          {/* Articles grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className={`group block ${theme.bg.card} border ${theme.border.primary} rounded-2xl p-6 hover:border-[#06b6d4]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#06b6d4]/5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[article.category] || categoryColors['Interview Prep']}`}>
                    {article.category}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                    <Clock className="w-3 h-3" />
                    {article.readTime} read
                  </span>
                </div>

                <h2 className={`text-lg font-bold ${theme.text.primary} mb-2 group-hover:text-[#06b6d4] transition-colors leading-snug`}>
                  {article.title}
                </h2>

                <p className={`text-sm ${theme.text.secondary} mb-4 leading-relaxed line-clamp-2`}>
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.text.muted}`}>
                    {new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#06b6d4] font-medium group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className={`mt-14 text-center p-8 rounded-2xl ${theme.bg.card} border ${theme.border.primary}`}>
            <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Ready to start preparing?</h2>
            <p className={`${theme.text.secondary} mb-5 text-sm`}>
              Get a real mock interview with a MAANG engineer and detailed feedback on your performance.
            </p>
            <Link
              to="/mock-interviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
            >
              Book a Mock Interview <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogIndex;
