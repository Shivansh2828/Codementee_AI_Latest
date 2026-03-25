import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, Search, Crown, ArrowRight, CheckCircle, Bot } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import api from '../../utils/api';

const AIFeaturesSection = () => {
  const { theme } = useTheme();
  const { currency, formatPrice } = useCurrency();
  const [trialPrice, setTrialPrice] = useState(null);

  useEffect(() => {
    fetchTrialPrice();
  }, [currency]);

  const fetchTrialPrice = async () => {
    try {
      const response = await api.get(`/pricing-plans?currency=${currency}`);
      const trialPlan = response.data.find(plan => plan.plan_id === 'agent_trial');
      if (trialPlan) {
        setTrialPrice(trialPlan.price);
      }
    } catch (error) {
      console.error('Failed to fetch trial price:', error);
    }
  };

  return (
    <section id="ai-features" className={`py-20 md:py-28 ${theme.bg.secondary}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Sparkles className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Free with Elite Plan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
            </div>

            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${theme.text.primary} leading-tight`}>
              2 AI Agents That{' '}
              <span className="text-[#06b6d4]">Job Hunt For You</span> 24/7
            </h2>
            <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
              While you prep for interviews, your AI agents search jobs, find referrals, and send you daily matches.
            </p>
          </div>

          {/* Two compact feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Job Search Agent */}
            <div className={`group rounded-2xl p-6 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center group-hover:bg-[#06b6d4] transition-colors duration-300">
                  <Search className="w-5 h-5 text-[#06b6d4] group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme.text.primary}`}>AI Job Search Agent</h3>
                  <span className="text-xs text-[#06b6d4] font-medium">Automated daily job matching</span>
                </div>
              </div>
              <p className={`${theme.text.secondary} text-sm mb-4 leading-relaxed`}>
                Paste your resume once. AI searches jobs daily, scores each one 0-100 against your profile, and emails you the top matches with direct apply links.
              </p>
              <div className="space-y-2">
                {['Searches multiple job boards automatically', 'AI scores every job based on your resume', 'Daily email digest with top matches'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#06b6d4] shrink-0" />
                    <span className={`text-sm ${theme.text.muted}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Finder Agent */}
            <div className={`group rounded-2xl p-6 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center group-hover:bg-[#06b6d4] transition-colors duration-300">
                  <Users className="w-5 h-5 text-[#06b6d4] group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme.text.primary}`}>AI Referral Finder</h3>
                  <span className="text-xs text-[#06b6d4] font-medium">LinkedIn-powered outreach</span>
                </div>
              </div>
              <p className={`${theme.text.secondary} text-sm mb-4 leading-relaxed`}>
                Enter any company. AI finds employees on LinkedIn, shows enriched profiles, and drafts 3 personalized referral messages you can copy-paste.
              </p>
              <div className="space-y-2">
                {['Finds employees from LinkedIn profiles', 'AI drafts formal, friendly & concise messages', 'One-click copy to send via LinkedIn'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#06b6d4] shrink-0" />
                    <span className={`text-sm ${theme.text.muted}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ai-agents"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Bot className="w-5 h-5" />
              Explore AI Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className={`text-sm ${theme.text.muted}`}>
                Included free with{' '}
                <a href="#pricing" className="text-amber-500 hover:underline font-medium">Elite Plan</a>
                {trialPrice && ` · Standalone from ${formatPrice(trialPrice)}/mo`}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;
