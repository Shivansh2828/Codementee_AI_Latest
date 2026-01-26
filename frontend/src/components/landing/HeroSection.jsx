import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteConfig, cohortData, targetCompanies } from '../../data/mock';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center pt-20 pb-16 md:pt-24 md:pb-20 bg-[#0f172a] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#06b6d4]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Seat Counter Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full seat-pulse" />
            <span className="text-sm text-slate-200 font-medium">
              Only <span className="text-[#06b6d4] font-bold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats left
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="brand-display mb-6">
            Real mock interviews with engineers who've <span className="gradient-text">cracked product based companies</span>
          </h1>

          {/* Subheadline */}
          <p className="body-large max-w-2xl mb-8">
            {siteConfig.subTagline}
          </p>

          {/* Clear Value Prop */}
          <div className="flex flex-wrap gap-3 mb-10 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155]">
              <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full" />
              <span className="text-slate-300">1-on-1 Mock Interviews</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155]">
              <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full" />
              <span className="text-slate-300">Written Feedback Reports</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155]">
              <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full" />
              <span className="text-slate-300">Resume Review</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155]">
              <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full" />
              <span className="text-slate-300">Starting ₹1,999/mo</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/apply" className="btn-primary inline-flex items-center gap-2">
              Apply for Founding Cohort
              <ArrowRight size={18} />
            </Link>
            <a href="#pricing" className="btn-secondary inline-flex items-center gap-2">
              View Pricing Plans
            </a>
          </div>

          {/* Company Logos Section */}
          <div className="pt-8 border-t border-[#334155]/50">
            <p className="text-sm text-slate-500 mb-4">Our mentors have interviewed at:</p>
            <div className="flex flex-wrap items-center gap-4">
              {targetCompanies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b]/50 border border-[#334155]/50 hover:border-[#06b6d4]/30 transition-colors"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: company.color }}
                  />
                  <span className="text-slate-300 font-medium text-sm">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
