import React, { lazy, Suspense } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { getArticle } from '../../data/blogArticles';
import useSEO from '../../hooks/useSEO';
import { Clock, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';

const ARTICLE_COMPONENTS = {
  'how-to-crack-maang-interviews-in-india': lazy(() => import('./articles/ArticleMANG')),
  'system-design-interview-questions-2025': lazy(() => import('./articles/ArticleSystemDesign')),
  'devops-interview-questions-kubernetes-docker': lazy(() => import('./articles/ArticleDevOps')),
  'mock-interview-preparation-guide': lazy(() => import('./articles/ArticleMockInterview')),
  'software-engineer-salary-india-maang-2025': lazy(() => import('./articles/ArticleSalary')),
};

const categoryColors = {
  'Interview Prep': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'System Design': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'DevOps': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Career': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const BlogArticle = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const article = getArticle(slug);
  const ArticleContent = ARTICLE_COMPONENTS[slug];

  useSEO({
    title: article ? `${article.title} | Codementee` : 'Article | Codementee',
    description: article?.description,
    canonical: article ? `https://codementee.io/blog/${slug}` : undefined,
    keywords: article?.keywords,
    schema: article ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedDate,
      dateModified: article.updatedDate,
      author: { '@type': 'Organization', name: 'Codementee', url: 'https://codementee.io' },
      publisher: { '@type': 'Organization', name: 'Codementee', url: 'https://codementee.io' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://codementee.io/blog/${slug}` },
    } : undefined,
  });

  if (!article || !ArticleContent) return <Navigate to="/blog" replace />;

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link to="/blog" className={`flex items-center gap-1 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" /> Blog
            </Link>
            <span className={`text-sm ${theme.text.muted}`}>/</span>
            <span className={`text-sm ${theme.text.secondary} truncate`}>{article.category}</span>
          </div>

          {/* Article header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[article.category] || categoryColors['Interview Prep']}`}>
                {article.category}
              </span>
              <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                <Clock className="w-3 h-3" /> {article.readTime} read
              </span>
              <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                <Calendar className="w-3 h-3" />
                {new Date(article.updatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} leading-tight mb-4`}>
              {article.title}
            </h1>
            <p className={`text-lg ${theme.text.secondary} leading-relaxed`}>
              {article.excerpt}
            </p>
          </header>

          {/* Article content */}
          <article className={`prose-article ${theme.text.secondary}`}>
            <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading...</div>}>
              <ArticleContent theme={theme} />
            </Suspense>
          </article>

          {/* CTA */}
          <div className={`mt-14 p-8 rounded-2xl ${theme.bg.card} border ${theme.border.primary} text-center`}>
            <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
              Practice with a real MAANG engineer
            </h2>
            <p className={`${theme.text.secondary} text-sm mb-5`}>
              Reading is not enough. Book a mock interview and get personalized feedback on your actual performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/mock-interviews"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
              >
                Book Mock Interview <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/learn"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 ${theme.bg.secondary} border ${theme.border.primary} ${theme.text.primary} font-semibold rounded-xl hover:border-[#06b6d4]/50 transition-all`}
              >
                Free Courses
              </Link>
            </div>
          </div>

          {/* Back to blog */}
          <div className="mt-8 text-center">
            <Link to="/blog" className={`text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              ← Back to all articles
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticle;
