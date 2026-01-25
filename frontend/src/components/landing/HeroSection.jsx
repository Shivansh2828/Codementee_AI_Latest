import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { siteConfig, cohortData } from '../../data/mock';

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
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#3f4816] bg-[#302f2c]/50">
            <span className="w-2 h-2 bg-[#d9fb06] rounded-full seat-pulse" />
            <span className="text-sm text-[#888680]">
              <span className="text-[#d9fb06] font-semibold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats remaining
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="brand-display mb-6">
            {siteConfig.tagline}
          </h1>

          {/* Subheadline */}
          <p className="body-large max-w-2xl mb-10">
            {siteConfig.subTagline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/apply" className="btn-primary inline-flex items-center gap-2">
              Apply for Founding Cohort
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary inline-flex items-center gap-2">
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-[#302f2c] border-2 border-[#1a1c1b] flex items-center justify-center"
                >
                  <Users size={16} className="text-[#888680]" />
                </div>
              ))}
            </div>
            <p className="text-sm text-[#888680]">
              Join 50+ engineers already preparing
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
