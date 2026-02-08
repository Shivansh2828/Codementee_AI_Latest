import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserPlus, Calendar, Users, MessageSquare, Trophy, ArrowRight } from 'lucide-react';

const MockInterviewProcessSection = () => {
  const { theme } = useTheme();

  const steps = [
    {
      icon: UserPlus,
      title: "1. Sign Up Free",
      description: "Create your account and explore the platform. No payment required to get started.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Calendar,
      title: "2. Book Interview",
      description: "Choose your target company, interview type, and preferred time slots. Pay only when ready.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Users,
      title: "3. Get Matched",
      description: "Our team assigns the perfect mentor - an engineer from your target company.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "4. Mock Interview",
      description: "1-on-1 real interview simulation with coding, system design, or behavioral questions.",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: Trophy,
      title: "5. Get Feedback",
      description: "Receive detailed feedback, improvement areas, and actionable tips to ace your real interview.",
      color: "from-indigo-400 to-purple-500"
    }
  ];

  return (
    <section className={`py-20 ${theme.bg.primary}`} id="process">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-6`}>
            How Mock Interviews Work
          </h2>
          <p className={`text-xl ${theme.text.secondary} max-w-3xl mx-auto`}>
            Simple 5-step process to get you interview-ready. From signup to success, we guide you every step of the way.
          </p>
        </div>

        {/* Process Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border ${theme.shadow} text-center h-full flex flex-col justify-between transform hover:-translate-y-2 transition-all duration-300`}>
                    {/* Icon */}
                    <div className="mb-4">
                      <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${theme.text.primary} mb-3`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow (hidden on mobile and last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <div className={`w-8 h-8 ${theme.bg.primary} rounded-full flex items-center justify-center ${theme.border.primary} border-2`}>
                        <ArrowRight className={`w-4 h-4 ${theme.text.accent}`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <h4 className={`font-bold ${theme.text.primary} mb-2`}>Real Engineers</h4>
            <p className={`text-sm ${theme.text.secondary}`}>Practice with actual engineers from Amazon, Google, Microsoft, and more</p>
          </div>

          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <h4 className={`font-bold ${theme.text.primary} mb-2`}>Quick Setup</h4>
            <p className={`text-sm ${theme.text.secondary}`}>Book and start your mock interview within 24-48 hours</p>
          </div>

          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📊</span>
            </div>
            <h4 className={`font-bold ${theme.text.primary} mb-2`}>Detailed Feedback</h4>
            <p className={`text-sm ${theme.text.secondary}`}>Get comprehensive reports with specific improvement areas</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="#pricing" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Your Mock Interview Journey
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MockInterviewProcessSection;