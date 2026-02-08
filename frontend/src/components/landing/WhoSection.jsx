import React from 'react';
import { Check, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { targetAudience } from '../../data/mock';

const WhoSection = () => {
  const { theme } = useTheme();
  const notForItems = [
    "Fresh graduates looking for first job",
    "Free resource seekers",
    "Those not willing to put in the work"
  ];

  return (
    <section className={`section ${theme.bg.primary}`}>
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className={`caption mb-4 block ${theme.text.accent}`}>Who This Is For</span>
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            Not for everyone. And that's the point.
          </h2>
          <p className={`body-large ${theme.text.secondary}`}>
            We keep cohorts small intentionally. Quality mentorship requires limited capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* This is for */}
          <div className="p-6 md:p-8 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5">
            <h3 className="text-lg font-bold text-[#06b6d4] mb-6 flex items-center gap-2">
              <Check size={22} />
              This is for you if...
            </h3>
            <ul className="space-y-4">
              {targetAudience.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#06b6d4]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#06b6d4]" />
                  </div>
                  <span className={`${theme.text.primary}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* This is NOT for */}
          <div className={`p-6 md:p-8 rounded-xl ${theme.border.primary} border ${theme.glass}`}>
            <h3 className={`text-lg font-bold ${theme.text.secondary} mb-6 flex items-center gap-2`}>
              <X size={22} />
              This is NOT for you if...
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full ${theme.bg.secondary} flex items-center justify-center shrink-0 mt-0.5`}>
                    <X size={12} className={`${theme.text.muted}`} />
                  </div>
                  <span className={`${theme.text.secondary}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoSection;
