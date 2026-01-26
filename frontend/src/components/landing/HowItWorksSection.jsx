import React from 'react';
import { howItWorks } from '../../data/mock';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section bg-[#0f172a]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption mb-4 block">Process</span>
          <h2 className="heading-1 mb-6">
            How it works
          </h2>
          <p className="body-large">
            Simple, focused, effective. No fluff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-[#334155] -translate-y-1/2 z-0" />
              )}
              
              <div className="relative z-10 p-6 rounded-xl border border-[#334155] bg-[#1e293b]/30 h-full hover:border-[#06b6d4]/30 transition-colors">
                {/* Step Number */}
                <div className="w-14 h-14 rounded-xl bg-[#06b6d4] flex items-center justify-center mb-5">
                  <span className="text-xl font-bold text-[#0f172a]">{step.step}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
