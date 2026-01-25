import React from 'react';
import { Video, FileText, Map, Users } from 'lucide-react';
import { solutionPoints } from '../../data/mock';

const SolutionSection = () => {
  const icons = [Video, FileText, Map, Users];

  return (
    <section className="section bg-[#302f2c]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">The Solution</span>
          <h2 className="heading-1 text-white mb-6">
            Human-in-the-loop preparation
          </h2>
          <p className="body-large">
            Codementee connects you with experienced engineers who've been on the other side of the table. No AI guesswork. Just real feedback from real interviewers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutionPoints.map((point, index) => {
            const Icon = icons[index];
            return (
              <div
                key={point.id}
                className="group p-8 rounded-lg border border-[#3f4816] bg-[#1a1c1b]/50 hover:bg-[#1a1c1b] transition-colors duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-lg bg-[#3f4816] flex items-center justify-center shrink-0 group-hover:bg-[#d9fb06] transition-colors duration-300">
                    <Icon className="text-[#d9fb06] group-hover:text-[#1a1c1b] transition-colors duration-300" size={26} />
                  </div>
                  <div>
                    <h3 className="heading-3 text-white mb-3">
                      {point.title}
                    </h3>
                    <p className="body-medium text-[#888680]">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emphasis */}
        <div className="mt-12 p-6 rounded-lg border border-[#d9fb06]/30 bg-[#3f4816]/20">
          <p className="text-center text-[#d9fb06] font-medium">
            "No AI-generated feedback. Every insight comes from someone who's hired engineers at scale."
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
