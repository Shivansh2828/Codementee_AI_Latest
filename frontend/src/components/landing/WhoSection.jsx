import React from 'react';
import { Check, X } from 'lucide-react';
import { targetAudience } from '../../data/mock';

const WhoSection = () => {
  const notForItems = [
    "Fresh graduates looking for first job",
    "Free resource seekers",
    "Those not willing to put in the work"
  ];

  return (
    <section className="section bg-[#1a1c1b]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">Who This Is For</span>
          <h2 className="heading-1 text-white mb-6">
            Not for everyone. And that's the point.
          </h2>
          <p className="body-large">
            We keep cohorts small intentionally. Quality mentorship requires limited capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* This is for */}
          <div className="p-8 rounded-lg border border-[#d9fb06]/30 bg-[#3f4816]/10">
            <h3 className="heading-3 text-[#d9fb06] mb-6 flex items-center gap-2">
              <Check size={24} />
              This is for you if...
            </h3>
            <ul className="space-y-4">
              {targetAudience.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#d9fb06]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#d9fb06]" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* This is NOT for */}
          <div className="p-8 rounded-lg border border-[#888680]/30 bg-[#302f2c]/30">
            <h3 className="heading-3 text-[#888680] mb-6 flex items-center gap-2">
              <X size={24} />
              This is NOT for you if...
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#888680]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} className="text-[#888680]" />
                  </div>
                  <span className="text-[#888680]">{item}</span>
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
