import React from 'react';
import { Video, FileText, FileCheck, Users } from 'lucide-react';
import { deliverables } from '../../data/mock';

const DeliverablesSection = () => {
  const icons = [Video, FileText, FileCheck, Users];

  return (
    <section className="section bg-[#0f172a]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption mb-4 block">What You Get</span>
          <h2 className="heading-1 mb-6">
            Clear deliverables. No fluff.
          </h2>
          <p className="body-large">
            Here's exactly what you're paying for. No hidden promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliverables.map((item, index) => {
            const Icon = icons[index];
            return (
              <div
                key={item.id}
                className="group p-6 md:p-8 rounded-xl border border-[#334155] bg-[#1e293b]/50 hover:bg-[#1e293b] hover:border-[#06b6d4]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#06b6d4] flex items-center justify-center shrink-0">
                    <Icon className="text-[#0f172a]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 mb-2">
                      {item.description}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Box */}
        <div className="mt-12 p-6 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white font-semibold text-lg">
                In short: Real interviews → Real feedback → Real results
              </p>
              <p className="text-slate-400 text-sm mt-1">
                No AI bots. No pre-recorded videos. Just experienced engineers helping you succeed.
              </p>
            </div>
            <a href="#pricing" className="btn-primary whitespace-nowrap">
              See Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverablesSection;
