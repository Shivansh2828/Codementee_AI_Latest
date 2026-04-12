import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { learningCategories } from '../../data/learningContent';
import ContentCard from '../shared/ContentCard';

const LearningShowcaseSection = () => {
  const { theme } = useTheme();

  return (
    <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}
          >
            <BookOpen className="w-4 h-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-[#06b6d4]">
              Comprehensive Curriculum
            </span>
          </div>

          <h2
            className={`text-3xl md:text-5xl font-bold mb-4 ${theme.text.primary} leading-tight`}
          >
            What You'll <span className="text-[#06b6d4]">Learn</span>
          </h2>
          <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
            Everything you need to crack product-based company interviews — from
            system design to behavioral prep.
          </p>
        </div>

        {/* Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {learningCategories.map((category) => (
            <ContentCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              topicCount={category.topicCount}
              href={category.href}
              isFree={category.isFree}
              gradient={category.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningShowcaseSection;
