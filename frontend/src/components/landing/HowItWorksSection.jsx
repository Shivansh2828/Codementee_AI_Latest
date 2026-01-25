import React from 'react';
import { howItWorks } from '../../data/mock';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section bg-[#1a1c1b]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">Process</span>
          <h2 className="heading-1 text-white mb-6">
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
                <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-[#3f4816] -translate-y-1/2 z-0" />
              )}
              
              <div className="relative z-10 p-6 rounded-lg border border-[#3f4816] bg-[#302f2c]/50 h-full">
                {/* Step Number */}
                <div className="w-16 h-16 rounded-full bg-[#3f4816] flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-[#d9fb06]">{step.step}</span>
                </div>
                
                <h3 className="heading-3 text-white mb-3">
                  {step.title}
                </h3>
                <p className="body-medium text-[#888680]">
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
