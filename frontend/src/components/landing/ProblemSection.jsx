import React from 'react';
import { AlertTriangle, X, HelpCircle } from 'lucide-react';
import { problemPoints } from '../../data/mock';

const ProblemSection = () => {
  const icons = [AlertTriangle, X, HelpCircle];

  return (
    <section className="section bg-[#1a1c1b]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">The Problem</span>
          <h2 className="heading-1 text-white mb-6">
            Why most interview prep fails
          </h2>
          <p className="body-large">
            You've done the courses. You've solved LeetCode. Yet interviews still feel like a gamble.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemPoints.map((point, index) => {
            const Icon = icons[index];
            return (
              <div
                key={point.id}
                className="card-dark p-8 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-[#3f4816]/50 flex items-center justify-center mb-6">
                  <Icon className="text-[#d9fb06]" size={24} />
                </div>
                <h3 className="heading-3 text-white mb-3">
                  {point.title}
                </h3>
                <p className="body-medium text-[#888680]">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
