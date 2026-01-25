import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteConfig, cohortData, targetCompanies } from '../../data/mock';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center pt-20 pb-16 md:pt-24 md:pb-20 bg-[#1a1c1b] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-[#3f4816]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-80 h-80 bg-[#3f4816]/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Seat Counter Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#d9fb06] bg-[#3f4816]/30">
            <span className="w-2 h-2 bg-[#d9fb06] rounded-full seat-pulse" />
            <span className="text-sm text-white font-medium">
              Only <span className="text-[#d9fb06] font-bold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats left
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="brand-display mb-6">
            {siteConfig.tagline}
          </h1>

          {/* Subheadline */}
          <p className="body-large max-w-2xl mb-8">
            {siteConfig.subTagline}
          </p>

          {/* Clear Value Prop */}
          <div className="flex flex-wrap gap-4 mb-10 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#302f2c] border border-[#3f4816]">
              <span className="w-1.5 h-1.5 bg-[#d9fb06] rounded-full" />
              <span className="text-white/90">1-on-1 Mock Interviews</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#302f2c] border border-[#3f4816]">
              <span className="w-1.5 h-1.5 bg-[#d9fb06] rounded-full" />
              <span className="text-white/90">Written Feedback Reports</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#302f2c] border border-[#3f4816]">
              <span className="w-1.5 h-1.5 bg-[#d9fb06] rounded-full" />
              <span className="text-white/90">Resume Review</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#302f2c] border border-[#3f4816]">
              <span className="w-1.5 h-1.5 bg-[#d9fb06] rounded-full" />
              <span className="text-white/90">Starting ₹1,999/mo</span>
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
          <div className="pt-8 border-t border-[#3f4816]/50">
            <p className="text-sm text-[#888680] mb-4">Our mentors have interviewed at:</p>
            <div className="flex flex-wrap items-center gap-6">
              {targetCompanies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#302f2c]/50 border border-[#3f4816]/50 hover:border-[#d9fb06]/30 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: company.color }}
                  />
                  <span className="text-white/80 font-medium text-sm">{company.name}</span>
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
