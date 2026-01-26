import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star } from 'lucide-react';
import { cohortData, pricingPlans } from '../../data/mock';

const PricingSection = () => {
  return (
    <section id="pricing" className="section bg-[#1e293b]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className="caption mb-4 block">Pricing</span>
          <h2 className="heading-1 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="body-large">
            Choose the plan that fits your interview timeline. All plans include founding member pricing.
          </p>
          
          {/* Seat Counter */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full seat-pulse" />
            <span className="text-sm text-slate-200">
              <span className="text-[#06b6d4] font-bold">{cohortData.seatsRemaining}</span> of {cohortData.totalSeats} founding seats remaining
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-2 border-[#06b6d4] bg-[#0f172a] relative shadow-lg shadow-[#06b6d4]/10' 
                  : 'border border-[#334155] bg-[#0f172a]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="bg-[#06b6d4] py-2.5 px-4 flex items-center justify-center gap-2">
                  <Star size={16} className="text-[#0f172a] fill-[#0f172a]" />
                  <span className="text-[#0f172a] font-bold text-sm uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.duration} membership</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-lg">{cohortData.currency}</span>
                    <span className="text-4xl md:text-5xl font-bold text-white">{plan.price.toLocaleString()}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 line-through text-sm">
                        {cohortData.currency}{plan.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-[#06b6d4] text-sm font-semibold">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    {cohortData.currency}{plan.perMonth.toLocaleString()}/month
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-[#06b6d4]' : 'bg-[#334155]'
                      }`}>
                        <Check size={12} className={plan.popular ? 'text-[#0f172a]' : 'text-[#06b6d4]'} />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
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
          <p className="text-slate-400 text-sm">
            All plans include access to private mentor group • Cancel anytime • Founding prices locked forever
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
