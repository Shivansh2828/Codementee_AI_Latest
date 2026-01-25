import React from 'react';
import { Video, FileText, FileCheck, Users } from 'lucide-react';
import { deliverables } from '../../data/mock';

const DeliverablesSection = () => {
  const icons = [Video, FileText, FileCheck, Users];

  return (
    <section className="section bg-[#1a1c1b]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">What You Get</span>
          <h2 className="heading-1 text-white mb-6">
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
                className="group p-8 rounded-lg border border-[#3f4816] bg-[#302f2c]/30 hover:bg-[#302f2c] transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-lg bg-[#d9fb06] flex items-center justify-center shrink-0">
                    <Icon className="text-[#1a1c1b]" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/90 mb-3">
                      {item.description}
                    </p>
                    <p className="text-sm text-[#888680]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Box */}
        <div className="mt-12 p-6 rounded-lg border-2 border-[#d9fb06]/30 bg-[#3f4816]/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white font-semibold text-lg">
                In short: Real interviews → Real feedback → Real results
              </p>
              <p className="text-[#888680] text-sm mt-1">
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
