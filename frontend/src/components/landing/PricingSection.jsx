import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { cohortData } from '../../data/mock';

const PricingSection = () => {
  return (
    <section id="pricing" className="section bg-[#302f2c]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">Founding Cohort</span>
          <h2 className="heading-1 text-white mb-6">
            Limited seats. Special pricing.
          </h2>
          <p className="body-large">
            Join our founding cohort and lock in the lowest price forever.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl border-2 border-[#d9fb06] bg-[#1a1c1b] overflow-hidden">
            {/* Badge */}
            <div className="bg-[#d9fb06] py-3 px-6 flex items-center justify-center gap-2">
              <Zap size={18} className="text-[#1a1c1b]" />
              <span className="text-[#1a1c1b] font-semibold text-sm uppercase tracking-wide">
                Founding Member Price
              </span>
            </div>

            <div className="p-8 md:p-10">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[#888680] text-2xl">{cohortData.currency}</span>
                  <span className="text-5xl md:text-6xl font-bold text-white">{cohortData.price}</span>
                  <span className="text-[#888680] text-lg">/month</span>
                </div>
                <p className="text-[#d9fb06] text-sm mt-2 font-medium">
                  {cohortData.note}
                </p>
              </div>

              {/* Seat Counter */}
              <div className="mb-8 p-4 rounded-lg bg-[#302f2c] text-center">
                <span className="text-2xl font-bold text-[#d9fb06]">{cohortData.seatsRemaining}</span>
                <span className="text-[#888680]"> of {cohortData.totalSeats} seats left</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {cohortData.includes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#d9fb06] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[#1a1c1b]" />
                    </div>
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/apply" className="btn-primary w-full justify-center gap-2">
                Apply for Early Access
                <ArrowRight size={18} />
              </Link>

              <p className="text-center text-xs text-[#888680] mt-4">
                Limited capacity. Applications reviewed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
