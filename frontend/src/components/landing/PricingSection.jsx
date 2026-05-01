import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, TrendingUp, Crown, BookOpen, Code, MessageSquare, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PricingSection = () => {
  const { theme } = useTheme();
  const { currency, loading: currencyLoading } = useCurrency();
  const { user, login } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Free tier features
  const freeFeatures = [
    { icon: BookOpen, label: 'Course Content' },
    { icon: Code, label: 'DSA Patterns' },
    { icon: MessageSquare, label: 'Behavioral Prep' },
  ];

  // Icon and color mapping for plan IDs
  const planConfig = {
    'starter': {
      icon: Sparkles,
      iconColor: 'text-blue-400',
      description: 'Best for engineers who want a structured evaluation before real interviews.',
      cta: 'Get Evaluated',
      popular: false
    },
    'pro': {
      icon: TrendingUp,
      iconColor: 'text-[#06b6d4]',
      description: 'Complete preparation cycle before product company interviews.',
      cta: 'Start Full Prep',
      popular: true,
      badge: 'Most Popular'
    },
    'elite': {
      icon: Crown,
      iconColor: 'text-amber-400',
      description: 'High-touch preparation for Tier-1 / MAANG aspirants.',
      cta: 'Go Elite',
      popular: false
    }
  };

  useEffect(() => {
    if (!currencyLoading) {
      fetchPricingPlans();
    }
  }, [currency, currencyLoading]);

  const fetchPricingPlans = async () => {
    try {
      // Use production URL if on production domain, otherwise localhost
      const isProduction = window.location.hostname === 'codementee.io' || window.location.hostname === 'www.codementee.io';
      const backendUrl = isProduction ? 'https://codementee.io' : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001');
      
      // Add cache-busting and no-cache headers to ensure fresh data
      const response = await axios.get(`${backendUrl}/api/pricing-plans`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        params: {
          _t: new Date().getTime(), // Cache buster
          currency: currency, // Pass currency parameter
          service_type: 'mock_interview' // Only fetch mock interview tiers
        }
      });
      
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No pricing data');
      }
      
      // Only show the 3 main mock interview tiers
      const allowedPlanIds = ['starter', 'pro', 'elite'];
      
      // Map API data to component format - handle any field names
      const mappedPlans = response.data
        .filter(plan => {
          // Check both is_active and active fields
          const isActive = plan.is_active !== undefined ? plan.is_active : plan.active;
          const planId = plan.plan_id || plan.id;
          return isActive !== false && allowedPlanIds.includes(planId);
        })
        .sort((a, b) => {
          const orderA = a.display_order || a.displayOrder || 0;
          const orderB = b.display_order || b.displayOrder || 0;
          return orderA - orderB;
        })
        .map(plan => {
          const planId = plan.plan_id || plan.id;
          const config = planConfig[planId] || {
            icon: Sparkles,
            iconColor: 'text-blue-400',
            description: plan.description || plan.name,
            cta: 'Get Started',
            popular: false
          };
          
          // Price is already in correct currency from backend
          const priceAmount = plan.price / 100; // Convert from cents/paise to dollars/rupees
          const currencySymbol = plan.currency_symbol || (currency === 'USD' ? '$' : '₹');
          const formattedPrice = currency === 'USD' 
            ? priceAmount.toFixed(0) 
            : priceAmount.toLocaleString('en-IN');
          
          return {
            id: planId,
            name: plan.name,
            price: formattedPrice,
            priceAmount: priceAmount,
            currency: plan.currency || currency,
            currencySymbol: currencySymbol,
            features: plan.features || [],
            icon: config.icon,
            iconColor: config.iconColor,
            description: config.description,
            cta: config.cta,
            popular: config.popular,
            badge: config.badge
          };
        });
      
      if (mappedPlans.length === 0) {
        throw new Error('No active plans');
      }
      
      setPlans(mappedPlans);
      setLoading(false);
    } catch (error) {
      // Fallback to default plans if API fails
      const isUSD = currency === 'USD';
      const fallbackPlans = [
        {
          id: 'starter',
          name: 'Mock Starter',
          price: isUSD ? '19' : '2,499',
          currencySymbol: isUSD ? '$' : '₹',
          features: [
            '1 MAANG-Level Mock Interview',
            'Detailed Feedback Report',
            'Resume Review (Email-based)',
            'Proven Resume Templates',
            'Free AI ATS Resume Checker Access'
          ],
          icon: Sparkles,
          iconColor: 'text-blue-400',
          description: 'Best for engineers who want a structured evaluation before real interviews.',
          cta: 'Get Evaluated',
          popular: false
        },
        {
          id: 'pro',
          name: 'Interview Pro',
          price: isUSD ? '45' : '6,999',
          currencySymbol: isUSD ? '$' : '₹',
          features: [
            '3 MAANG-Level Mock Interviews',
            'Improvement Tracking Between Mocks',
            'Resume Review by MAANG Engineer',
            '1 Strategy Call',
            'Proven Resume Templates',
            'Free AI ATS Resume Checker Access'
          ],
          icon: TrendingUp,
          iconColor: 'text-[#06b6d4]',
          description: 'Complete preparation cycle before product company interviews.',
          cta: 'Start Full Prep',
          popular: true,
          badge: 'Most Popular'
        },
        {
          id: 'elite',
          name: 'Interview Elite',
          price: isUSD ? '123' : '9,999',
          currencySymbol: isUSD ? '$' : '₹',
          features: [
            '6 MAANG-Level Mock Interviews',
            'Live Resume Review Session',
            'Referral Guidance (Best Effort)',
            'Priority WhatsApp Support',
            'Proven Resume Templates',
            'Free AI ATS Resume Checker Access',
            '🤖 AI Job Search Agent (Daily Matches)',
            '🤖 AI Referral Finder Agent'
          ],
          icon: Crown,
          iconColor: 'text-amber-400',
          description: 'High-touch preparation for Tier-1 / MAANG aspirants.',
          cta: 'Go Elite',
          popular: false
        }
      ];
      setPlans(fallbackPlans);
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePricingButtonClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <section id="pricing" className={`py-20 md:py-28 ${theme.bg.secondary}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className={`text-lg ${theme.text.primary}`}>Loading pricing...</div>
          </div>
        </div>
      </section>
    );
  }

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

        {/* Free Tier Indicator */}
        <div className={`max-w-2xl mx-auto mb-12 rounded-2xl ${theme.bg.card} border ${theme.border.primary} p-6`}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                Free
              </span>
              <span className={`text-lg font-semibold ${theme.text.primary}`}>Start learning at no cost</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
              {freeFeatures.map((item, idx) => {
                const FeatureIcon = item.icon;
                return (
                  <span key={idx} className={`inline-flex items-center gap-1.5 text-sm ${theme.text.secondary}`}>
                    <FeatureIcon size={14} className="text-[#06b6d4]" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
          {Array.isArray(plans) && plans.length > 0 ? (
            plans.map((plan) => {
              if (!plan || !plan.icon) {
                console.error('Invalid plan data:', plan);
                return null;
              }
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
                      <span className={`text-lg ${theme.text.secondary}`}>{plan.currencySymbol}</span>
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
                  <button
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        setShowLoginModal(true);
                      } else {
                        window.location.href = '/mentee/book';
                      }
                    }}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/30'
                        : `${theme.bg.secondary} ${theme.text.primary} hover:bg-[#06b6d4] hover:text-white border ${theme.border.primary}`
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className={theme.text.secondary}>No pricing plans available</p>
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <div className="text-center">
          <p className={`text-sm ${theme.text.muted}`}>
            One-time payment • No subscriptions • No hidden fees
          </p>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme.bg.card} rounded-2xl p-8 max-w-md w-full border ${theme.border.primary}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary}`}>Sign In</h3>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                  }}
                  className={`p-1 hover:${theme.bg.secondary} rounded-lg transition-colors`}
                >
                  <X className={`w-6 h-6 ${theme.text.secondary}`} />
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg ${theme.bg.secondary} ${theme.border.primary} border ${theme.text.primary} placeholder-${theme.text.muted} focus:outline-none focus:border-[#06b6d4] transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg ${theme.bg.secondary} ${theme.border.primary} border ${theme.text.primary} placeholder-${theme.text.muted} focus:outline-none focus:border-[#06b6d4] transition-colors`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-[#06b6d4] hover:bg-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <p className={`text-sm ${theme.text.muted} text-center`}>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#06b6d4] hover:underline font-medium">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;