import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cohortData } from '../../data/mock';

const CTASection = () => {
  return (
    <section className="section bg-[#1a1c1b] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3f4816]/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-1 text-white mb-6">
            Ready to stop guessing?
          </h2>
          <p className="body-large mb-8 max-w-xl mx-auto">
            Join the founding cohort and get real interview feedback from engineers who've been on hiring committees.
          </p>

          {/* Seat Counter */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#d9fb06] bg-[#3f4816]/30">
            <span className="w-2 h-2 bg-[#d9fb06] rounded-full seat-pulse" />
            <span className="text-sm text-white">
              Only <span className="text-[#d9fb06] font-bold">{cohortData.seatsRemaining}</span> founding seats remaining
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply" className="btn-primary inline-flex items-center justify-center gap-2">
              Apply for Early Access
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="mt-6 text-sm text-[#888680]">
            {cohortData.currency}{cohortData.price}/month · Cancel anytime · {cohortData.note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
