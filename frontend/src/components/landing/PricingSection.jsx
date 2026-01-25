import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Star } from 'lucide-react';
import { cohortData, pricingPlans } from '../../data/mock';

const PricingSection = () => {
  return (
    <section id="pricing" className="section bg-[#302f2c]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">Pricing</span>
          <h2 className="heading-1 text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="body-large">
            Choose the plan that fits your interview timeline. All plans include founding member pricing.
          </p>
          
          {/* Seat Counter */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-[#d9fb06] bg-[#3f4816]/30">
            <span className="w-2 h-2 bg-[#d9fb06] rounded-full seat-pulse" />
            <span className="text-sm text-white">
              <span className="text-[#d9fb06] font-bold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats remaining
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-2 border-[#d9fb06] bg-[#1a1c1b] relative' 
                  : 'border border-[#3f4816] bg-[#1a1c1b]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="bg-[#d9fb06] py-2 px-4 flex items-center justify-center gap-2">
                  <Star size={16} className="text-[#1a1c1b] fill-[#1a1c1b]" />
                  <span className="text-[#1a1c1b] font-bold text-sm uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-[#888680] text-sm">{plan.duration} membership</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#888680] text-lg">{cohortData.currency}</span>
                    <span className="text-4xl md:text-5xl font-bold text-white">{plan.price.toLocaleString()}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#888680] line-through text-sm">
                        {cohortData.currency}{plan.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-[#d9fb06] text-sm font-semibold">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  <p className="text-[#888680] text-sm mt-2">
                    {cohortData.currency}{plan.perMonth.toLocaleString()}/month
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-[#d9fb06]' : 'bg-[#3f4816]'
                      }`}>
                        <Check size={12} className={plan.popular ? 'text-[#1a1c1b]' : 'text-[#d9fb06]'} />
                      </div>
                      <span className="text-white/90 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link 
                  to="/apply" 
                  className={`w-full justify-center gap-2 ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-[#888680] text-sm">
            All plans include access to private mentor group • Cancel anytime • Founding prices locked forever
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
