import React from 'react';
import { AlertTriangle, X, HelpCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { problemPoints } from '../../data/mock';

const ProblemSection = () => {
  const { theme } = useTheme();
  const icons = [AlertTriangle, X, HelpCircle];

  return (
    <section className={`section ${theme.bg.primary}`}>
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className={`caption mb-4 block ${theme.text.accent}`}>The Problem</span>
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            Why most interview prep fails
          </h2>
          <p className={`body-large ${theme.text.secondary}`}>
            You've done the courses. You've solved LeetCode. Yet interviews still feel like a gamble.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemPoints.map((point, index) => {
            const Icon = icons[index];
            return (
              <div
                key={point.id}
                className={`p-6 md:p-8 rounded-xl ${theme.border.primary} border ${theme.glass} hover:border-[#475569] transition-colors`}
              >
                <div className={`w-12 h-12 rounded-xl ${theme.bg.secondary} flex items-center justify-center mb-6`}>
                  <Icon className="text-[#06b6d4]" size={24} />
                </div>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-3`}>
                  {point.title}
                </h3>
                <p className={`${theme.text.secondary}`}>
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
