import React from 'react';
import { Video, FileText, Map, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { solutionPoints } from '../../data/mock';

const SolutionSection = () => {
  const { theme } = useTheme();
  const icons = [Video, FileText, Map, Users];

  return (
    <section className={`section ${theme.bg.secondary}`}>
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className={`caption mb-4 block ${theme.text.accent}`}>The Solution</span>
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            Human-in-the-loop preparation
          </h2>
          <p className={`body-large ${theme.text.secondary}`}>
            Codementee connects you with experienced engineers who've been on the other side of the table. No AI guesswork. Just real feedback from real interviewers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutionPoints.map((point, index) => {
            const Icon = icons[index];
            return (
              <div
                key={point.id}
                className={`group p-6 md:p-8 rounded-xl ${theme.border.primary} border ${theme.glass} hover:border-[#06b6d4]/30 transition-all duration-300`}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl ${theme.bg.secondary} flex items-center justify-center shrink-0 group-hover:bg-[#06b6d4] transition-colors duration-300`}>
                    <Icon className={`text-[#06b6d4] group-hover:text-white transition-colors duration-300`} size={24} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                      {point.title}
                    </h3>
                    <p className={`${theme.text.secondary}`}>
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emphasis */}
        <div className="mt-12 p-5 rounded-xl border border-[#06b6d4]/20 bg-[#06b6d4]/5">
          <p className="text-center text-[#06b6d4] font-medium">
            "No AI-generated feedback. Every insight comes from someone who's hired engineers at scale."
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
