import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, Mail, Search, Crown, Bot, ArrowRight, CheckCircle, Star, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AIFeaturesSection = () => {
  const { theme } = useTheme();

  return (
    <section id="ai-features" className={`py-20 md:py-28 ${theme.bg.secondary}`}>
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-amber-500/40`}>
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">Exclusive to Elite Plan</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary} leading-tight`}>
            2 AI Agents That{' '}
            <span className="text-[#06b6d4]">Job Hunt For You</span> 24/7
          </h2>
          <p className={`text-lg md:text-xl ${theme.text.secondary} max-w-2xl mx-auto`}>
            While you prep for interviews, your AI agents search jobs, find referrals, draft messages, and send you daily matches. Automatically.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-16">

          {/* Job Search Agent */}
          <div className={`group rounded-2xl p-8 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center group-hover:bg-[#06b6d4] transition-colors duration-300">
                <Search className="w-6 h-6 text-[#06b6d4] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme.text.primary}`}>AI Job Search Agent</h3>
                <span className="text-xs text-[#06b6d4] font-medium">Runs daily at 7 AM</span>
              </div>
            </div>

            <p className={`${theme.text.secondary} mb-6 leading-relaxed`}>
              Paste your resume once. AI searches best suitable jobs every day for you , scores each job 0-100 against your profile, and emails you the top matches.
            </p>

            <div className="space-y-3 mb-6">
              {[
                'Searches multiple job boards automatically',
                'AI scores every job based on your resume',
                'Daily email digest with top matches',
                'Direct apply links — no fake listings'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                  <span className={`text-sm ${theme.text.secondary}`}>{item}</span>
                </div>
              ))}
            </div>

            {/* Mini preview */}
            <div className={`${theme.bg.secondary} rounded-xl p-4 ${theme.border.primary} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${theme.text.muted} uppercase tracking-wider`}>Sample Match</span>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">92/100</span>
              </div>
              <p className={`text-sm font-medium ${theme.text.primary}`}>SDE-2 at Razorpay</p>
              <p className={`text-xs ${theme.text.muted}`}>Bangalore · ₹28-42 LPA · Skills: 5/6 match</p>
            </div>
          </div>

          {/* Referral Finder Agent */}
          <div className={`group rounded-2xl p-8 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center group-hover:bg-[#06b6d4] transition-colors duration-300">
                <Users className="w-6 h-6 text-[#06b6d4] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme.text.primary}`}>AI Referral Finder Agent</h3>
                <span className="text-xs text-[#06b6d4] font-medium">LinkedIn-powered</span>
              </div>
            </div>

            <p className={`${theme.text.secondary} mb-6 leading-relaxed`}>
              Enter any company name. AI finds employees on LinkedIn, shows you who to reach out to, and drafts 3 personalized referral messages you can copy-paste.
            </p>

            <div className="space-y-3 mb-6">
              {[
                'Finds employees from LinkedIn profiles',
                'AI drafts formal, friendly & concise messages',
                'Referral tips based on employee seniority',
                'One-click copy to send via LinkedIn'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                  <span className={`text-sm ${theme.text.secondary}`}>{item}</span>
                </div>
              ))}
            </div>

            {/* Mini preview */}
            <div className={`${theme.bg.secondary} rounded-xl p-4 ${theme.border.primary} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${theme.text.muted} uppercase tracking-wider`}>Sample Referral</span>
                <span className="text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded-full">✅ Profile</span>
              </div>
              <p className={`text-sm font-medium ${theme.text.primary}`}>Priya Sharma — SDE-3 at Google</p>
              <p className={`text-xs ${theme.text.muted}`}>Engineering · Senior · "Connect on LinkedIn with a personalized note"</p>
            </div>
          </div>
        </div>

        {/* How it works — compact flow */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { icon: Briefcase, label: 'Paste Resume' },
              { icon: Bot, label: 'AI Searches Daily' },
              { icon: Mail, label: 'Get Email Digest' },
              { icon: Star, label: 'Apply & Get Referred' }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-3 px-5 py-3 ${theme.bg.card} rounded-xl ${theme.border.primary} border`}>
                  <step.icon className="w-5 h-5 text-[#06b6d4]" />
                  <span className={`text-sm font-medium ${theme.text.primary} whitespace-nowrap`}>{step.label}</span>
                </div>
                {i < 3 && (
                  <ArrowRight className={`w-5 h-5 ${theme.text.muted} hidden md:block mx-2 shrink-0`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <div className={`${theme.bg.card} border-2 border-amber-500/30 rounded-2xl p-8 md:p-10`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-amber-500" />
              <span className={`text-lg font-bold ${theme.text.primary}`}>Elite Plan Only</span>
            </div>
            <h3 className={`text-2xl md:text-3xl font-bold ${theme.text.primary} mb-3`}>
              Stop applying manually.
            </h3>
            <p className={`${theme.text.secondary} mb-8 max-w-lg mx-auto`}>
              Elite members get both AI agents included — job search + referral finder. Your career autopilot starts the moment you sign up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                <Crown className="w-5 h-5" />
                Get Elite Access
              </Link>
              <a
                href="#pricing"
                className={`inline-flex items-center gap-2 ${theme.text.muted} hover:text-[#06b6d4] transition-colors text-sm`}
              >
                View all plans
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;