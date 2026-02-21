import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, TrendingUp, Crown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PricingSection = () => {
  const { theme } = useTheme();

  const plans = [
    {
      id: 'starter',
      name: 'Mock Starter',
      price: '2,999',
      description: 'Best for engineers who want a structured evaluation before real interviews.',
      icon: Sparkles,
      iconColor: 'text-blue-400',
      features: [
        '1 MAANG-Level Mock Interview',
        'Detailed Feedback Report',
        'Resume Review (Email-based)',
        'Proven Resume Templates',
        'Free AI ATS Resume Checker Access'
      ],
      cta: 'Get Evaluated',
      popular: false
    },
    {
      id: 'pro',
      name: 'Interview Pro',
      price: '6,999',
      description: 'Complete preparation cycle before product company interviews.',
      icon: TrendingUp,
      iconColor: 'text-[#06b6d4]',
      badge: 'Most Popular',
      features: [
        '3 MAANG-Level Mock Interviews',
        'Improvement Tracking Between Mocks',
        'Resume Review by MAANG Engineer',
        '1 Strategy Call',
        'Proven Resume Templates',
        'Free AI ATS Resume Checker Access'
      ],
      cta: 'Start Full Prep',
      popular: true
    },
    {
      id: 'elite',
      name: 'Interview Elite',
      price: '14,999',
      description: 'High-touch preparation for Tier-1 / MAANG aspirants.',
      icon: Crown,
      iconColor: 'text-amber-400',
      features: [
        '6 MAANG-Level Mock Interviews',
        'Live Resume Review Session',
        'Referral Guidance (Best Effort)',
        'Priority WhatsApp Support',
        'Proven Resume Templates',
        'Free AI ATS Resume Checker Access'
      ],
      cta: 'Go Elite',
      popular: false
    }
  ];

  return (
    <section id="pricing" className={`py-20 md:py-28 ${theme.bg.secondary}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${theme.bg.card} ${theme.text.accent} border ${theme.border.accent}`}>
            Pricing
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary}`}>
            Simple, Outcome-Based Pricing
          </h2>
          <p className={`text-lg md:text-xl ${theme.text.secondary}`}>
            One-time payment. No subscriptions. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? `${theme.bg.card} border-2 border-[#06b6d4] shadow-2xl shadow-[#06b6d4]/20 md:scale-105 md:-mt-4 md:mb-4`
                    : `${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/50`
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${theme.bg.secondary} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                    </div>
                    <h3 className={`text-2xl font-bold ${theme.text.primary}`}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${theme.text.secondary} mb-6 leading-relaxed`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg ${theme.text.secondary}`}>₹</span>
                      <span className={`text-5xl font-bold ${theme.text.primary}`}>
                        {plan.price}
                      </span>
                    </div>
                    <p className={`text-sm ${theme.text.muted} mt-2`}>
                      One-Time Payment
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular ? 'bg-[#06b6d4]' : `${theme.bg.secondary}`
                        }`}>
                          <Check 
                            size={12} 
                            className={plan.popular ? 'text-white' : 'text-[#06b6d4]'} 
                            strokeWidth={3}
                          />
                        </div>
                        <span className={`text-sm ${theme.text.secondary}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to="/register"
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/30'
                        : `${theme.bg.secondary} ${theme.text.primary} hover:bg-[#06b6d4] hover:text-white border ${theme.border.primary}`
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center">
          <p className={`text-sm ${theme.text.muted} mb-2`}>
            One-time payment • No subscriptions • No hidden fees
          </p>
          <p className={`text-xs ${theme.text.muted} italic`}>
            ⚡ Prices may increase as more engineers join
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
