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
    <section className="section bg-[#1e293b]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption mb-4 block">Who This Is For</span>
          <h2 className="heading-1 mb-6">
            Not for everyone. And that's the point.
          </h2>
          <p className="body-large">
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
                  <span className="text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* This is NOT for */}
          <div className="p-6 md:p-8 rounded-xl border border-[#334155] bg-[#0f172a]/50">
            <h3 className="text-lg font-bold text-slate-400 mb-6 flex items-center gap-2">
              <X size={22} />
              This is NOT for you if...
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#334155] flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} className="text-slate-500" />
                  </div>
                  <span className="text-slate-400">{item}</span>
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
