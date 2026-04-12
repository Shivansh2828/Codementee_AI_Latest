import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { CalendarCheck, Users, BarChart3, ArrowRight, ChevronDown, Mic2 } from 'lucide-react';

const MockInterviewProcessSection = () => {
  const { theme } = useTheme();

  const steps = [
    {
      number: 1,
      icon: CalendarCheck,
      title: 'Schedule',
      description: 'Choose your target company, interview type, and a time that works for you.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      number: 2,
      icon: Users,
      title: 'Join',
      description: '1-on-1 live session with an engineer from a MAANG company.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      number: 3,
      icon: BarChart3,
      title: 'Get Insights',
      description: 'Receive a detailed feedback report with actionable improvement areas.',
      color: 'from-orange-400 to-amber-500',
    },
  ];

  return (
    <section className={`py-20 md:py-28 ${theme.bg.primary}`} id="process">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}
          >
            <Mic2 className="w-4 h-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-[#06b6d4]">
              Simple 3-Step Process
            </span>
          </div>

          <h2
            className={`text-3xl md:text-5xl font-bold mb-4 ${theme.text.primary} leading-tight`}
          >
            How Mock Interviews <span className="text-[#06b6d4]">Work</span>
          </h2>
          <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
            From scheduling to feedback — we make it straightforward so you can focus on what matters.
          </p>
        </div>

        {/* Process Steps */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop: horizontal with arrows */}
          <div className="hidden md:flex items-stretch justify-center gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  {/* Step Card */}
                  <div className="flex-1 max-w-xs">
                    <div
                      className={`${theme.glass} rounded-2xl p-8 ${theme.border.primary} border ${theme.shadow} text-center h-full flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300`}
                    >
                      {/* Step number */}
                      <span className="text-xs font-bold text-[#06b6d4] tracking-widest uppercase mb-4">
                        Step {step.number}
                      </span>

                      {/* Icon */}
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-5`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-3`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center px-4">
                      <div
                        className={`w-10 h-10 ${theme.bg.card} rounded-full flex items-center justify-center ${theme.border.primary} border-2 shrink-0`}
                      >
                        <ArrowRight className="w-5 h-5 text-[#06b6d4]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile: vertical with arrows */}
          <div className="flex md:hidden flex-col items-center gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  {/* Step Card */}
                  <div className="w-full max-w-sm">
                    <div
                      className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border ${theme.shadow} text-center`}
                    >
                      {/* Step number */}
                      <span className="text-xs font-bold text-[#06b6d4] tracking-widest uppercase mb-3 block">
                        Step {step.number}
                      </span>

                      {/* Icon */}
                      <div
                        className={`w-14 h-14 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-4`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="py-3">
                      <div
                        className={`w-9 h-9 ${theme.bg.card} rounded-full flex items-center justify-center ${theme.border.primary} border-2`}
                      >
                        <ChevronDown className="w-5 h-5 text-[#06b6d4]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-14">
          <Link
            to="/mock-interviews"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Explore Mock Interviews
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MockInterviewProcessSection;
