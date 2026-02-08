import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cohortData } from '../../data/mock';

const CTASection = () => {
  const { theme } = useTheme();

  return (
    <section className={`section ${theme.bg.secondary} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06b6d4]/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            Ready to stop guessing?
          </h2>
          <p className={`body-large mb-8 max-w-xl mx-auto ${theme.text.secondary}`}>
            Join the founding cohort and get real interview feedback from engineers who've been on hiring committees.
          </p>

          {/* Seat Counter */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full seat-pulse" />
            <span className={`text-sm ${theme.text.primary}`}>
              Only <span className="text-[#06b6d4] font-bold">{cohortData.seatsRemaining}</span> founding seats remaining
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply" className="btn-primary inline-flex items-center justify-center gap-2">
              Apply for Early Access
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className={`mt-6 text-sm ${theme.text.secondary}`}>
            Starting at {cohortData.currency}1,999/month · Cancel anytime · Founding prices locked forever
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
