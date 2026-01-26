import React from 'react';
import { Video, FileText, Map, Users } from 'lucide-react';
import { solutionPoints } from '../../data/mock';

const SolutionSection = () => {
  const icons = [Video, FileText, Map, Users];

  return (
    <section className="section bg-[#0f172a]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption mb-4 block">The Solution</span>
          <h2 className="heading-1 mb-6">
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
                className="group p-6 md:p-8 rounded-xl border border-[#334155] bg-[#1e293b]/30 hover:bg-[#1e293b]/60 hover:border-[#06b6d4]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#334155] flex items-center justify-center shrink-0 group-hover:bg-[#06b6d4] transition-colors duration-300">
                    <Icon className="text-[#06b6d4] group-hover:text-[#0f172a] transition-colors duration-300" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {point.title}
                    </h3>
                    <p className="text-slate-400">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emphasis */}
        <div className="mt-12 p-5 rounded-xl border border-[#06b6d4]/20 bg-[#06b6d4]/5">
          <p className="text-center text-[#06b6d4] font-medium">
            "No AI-generated feedback. Every insight comes from someone who's hired engineers at scale."
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
