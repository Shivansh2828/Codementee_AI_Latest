import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cohortData } from '../../data/mock';
import api from '../../utils/api';

const PricingSection = () => {
  const { theme } = useTheme();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPricingPlans = async () => {
    try {
      console.log('Fetching pricing plans from API...');
      // Add cache busting to ensure fresh data
      const response = await api.get(`/pricing-plans?t=${Date.now()}`);
      console.log('API Response:', response.data);
      if (response.data && response.data.length > 0) {
        setPricingPlans(response.data);
      } else {
        console.log('No pricing data from API, using fallback');
        // Fallback to mock data if API returns empty
        const { pricingPlans: mockPlans } = await import('../../data/mock');
        console.log('Mock data:', mockPlans);
        setPricingPlans(mockPlans);
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      console.log('Falling back to mock data');
      // Fallback to mock data if API fails
      const { pricingPlans: mockPlans } = await import('../../data/mock');
      console.log('Mock data:', mockPlans);
      setPricingPlans(mockPlans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchPricingPlans();
  };

  if (loading) {
    return (
      <section id="pricing" className={`section ${theme.bg.secondary}`}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-pulse">
              <div className={`h-8 ${theme.bg.card} rounded mb-4`}></div>
              <div className={`h-12 ${theme.bg.card} rounded mb-6`}></div>
              <div className={`h-6 ${theme.bg.card} rounded`}></div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="pricing" className={`section ${theme.bg.secondary}`}>
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className={`caption mb-4 block ${theme.text.accent}`}>Pricing</span>
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            One-time pricing, no subscriptions
          </h2>
          <p className={`body-large mb-6 ${theme.text.secondary}`}>
            Pay once, get expert mock interviews. No recurring charges, no hidden fees.
          </p>
          
          {/* Launch Notice */}
          <div className={`${theme.bg.card} ${theme.border.accent} border rounded-lg p-4 mb-6`}>
            <p className={`${theme.text.accent} text-sm font-medium`}>
              🚀 Limited Launch - Only 25 spots available for our founding cohort
            </p>
            <p className={`${theme.text.muted} text-xs mt-1`}>
              Direct access to engineers from Amazon, Google, Microsoft, Meta, and Netflix
            </p>
          </div>
          
          {/* Seat Counter */}
          <div className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full ${theme.border.accent} border ${theme.bg.card}`}>
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full seat-pulse" />
            <span className={`text-sm ${theme.text.secondary}`}>
              <span className="text-[#06b6d4] font-bold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats remaining
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans && pricingPlans.length > 0 ? pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${
                plan.popular 
                  ? `border-2 border-[#06b6d4] ${theme.bg.card} relative ${theme.shadow}` 
                  : `${theme.border.primary} border ${theme.bg.card}`
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="bg-[#06b6d4] py-2.5 px-4 flex items-center justify-center gap-2">
                  <Star size={16} className="text-white fill-white" />
                  <span className="text-white font-bold text-sm uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${theme.text.primary} mb-1`}>{plan.name}</h3>
                  <p className={`${theme.text.secondary} text-sm`}>{plan.duration} membership</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`${theme.text.secondary} text-lg`}>{cohortData.currency}</span>
                    <span className={`text-4xl md:text-5xl font-bold ${theme.text.primary}`}>{plan.price?.toLocaleString() || '0'}</span>
                    <span className={`${theme.text.muted} text-sm ml-2`}>/ ${plan.priceUSD ? `${plan.priceUSD}` : 'USD'}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`${theme.text.muted} line-through text-sm`}>
                        {cohortData.currency}{plan.originalPrice?.toLocaleString() || '0'}
                      </span>
                      <span className="text-[#06b6d4] text-sm font-semibold">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  <p className={`${theme.text.secondary} text-sm mt-2`}>
                    One-time payment • {plan.perSession ? `₹${plan.perSession?.toLocaleString() || '0'}/session` : 'No recurring charges'}
                  </p>
                  {plan.limitedSeats && (
                    <p className="text-orange-500 text-xs mt-1 font-medium">
                      Only {plan.limitedSeats} spots available
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-[#06b6d4]' : `${theme.bg.secondary}`
                      }`}>
                        <Check size={12} className={plan.popular ? 'text-white' : 'text-[#06b6d4]'} />
                      </div>
                      <span className={`${theme.text.secondary} text-sm`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Clear Limits Display */}
                <div className={`${theme.bg.secondary} ${theme.border.primary} border rounded-lg p-3 mb-4`}>
                  <p className={`${theme.text.muted} text-xs font-medium mb-1`}>What's included:</p>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.text.primary} text-sm`}>Live Mock Interviews</span>
                    <span className="text-[#06b6d4] font-bold">
                      {plan.id === 'starter' ? '1 session' : 
                       plan.id === 'professional' ? '3 sessions' : 
                       '6 sessions'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`${theme.text.primary} text-sm`}>Resume Review</span>
                    <span className={`${theme.text.secondary} text-sm`}>
                      {plan.id === 'starter' ? 'Email' : 
                       plan.id === 'professional' ? 'Live session' : 
                       '2 Live sessions'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`${theme.text.primary} text-sm`}>Per Session Cost</span>
                    <span className={`${theme.text.secondary} text-sm`}>₹{plan.perSession?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {/* Justification */}
                <div className={`${theme.bg.secondary} rounded-lg p-3 mb-6`}>
                  <p className={`${theme.text.secondary} text-xs italic`}>
                    {plan.justification}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/register" 
                    className={`w-full justify-center gap-2 ${
                      plan.popular ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-12">
              <p className={`${theme.text.secondary}`}>Loading pricing plans...</p>
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className={`${theme.text.secondary} text-sm`}>
            One-time payment • No subscriptions • No hidden fees • Limited launch pricing
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
