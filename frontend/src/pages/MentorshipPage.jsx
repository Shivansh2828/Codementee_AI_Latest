import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PricingTierCard from '../components/pricing/PricingTierCard';
import api from '../utils/api';
import {
  ArrowRight,
  Users,
  CalendarClock,
  Award,
  BookOpen,
  Building2,
  MessageCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Users,
    title: 'Keep the Same Coach',
    description: 'Work with one dedicated mentor throughout your journey. They learn your strengths, weaknesses, and goals.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: CalendarClock,
    title: 'Flexible Sessions',
    description: 'Schedule sessions at times that work for you. Reschedule up to 24 hours before with no penalty.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Award,
    title: 'Best Coaches',
    description: 'Our mentors are senior engineers at MAANG companies with 5+ years of experience and proven track records.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'Personalized Study Plans',
    description: 'Get a custom roadmap tailored to your target company, role, and timeline — updated after every session.',
    color: 'from-orange-400 to-amber-500',
  },
  {
    icon: Building2,
    title: 'Company Insights',
    description: 'Learn insider tips about interview processes, team culture, and what hiring managers actually look for.',
    color: 'from-rose-400 to-red-500',
  },
  {
    icon: MessageCircle,
    title: '1:1 Chat Support',
    description: 'Message your mentor between sessions for quick questions, resume feedback, or motivation boosts.',
    color: 'from-indigo-400 to-violet-500',
  },
];

const faqItems = [
  {
    question: 'How is mentorship different from mock interviews?',
    answer:
      'Mock interviews are one-off practice sessions focused on simulating a real interview. Mentorship is an ongoing relationship — your mentor helps you build a study plan, tracks your progress across sessions, and provides continuous guidance on everything from resume to offer negotiation.',
  },
  {
    question: 'What happens in a typical mentorship session?',
    answer:
      'Each 1-hour session is tailored to your needs. It could include a mock interview with detailed feedback, a deep-dive into a weak topic, system design walkthrough, resume review, or career strategy discussion. Your mentor adapts the agenda based on where you are in your prep.',
  },
  {
    question: 'How are mentors selected and assigned?',
    answer:
      'Our admin team carefully matches you with a mentor based on your target company, role level, and focus areas. All mentors are active engineers at top product companies with extensive interviewing experience. You keep the same mentor for your entire plan.',
  },
  {
    question: 'What is the cancellation and rescheduling policy?',
    answer:
      'You can reschedule any session up to 24 hours in advance at no cost. If you need to cancel your plan entirely, contact us within 7 days of purchase for a full refund on unused sessions. After 7 days, unused sessions remain available until your plan expires.',
  },
];

const fallbackPlans = {
  INR: [
    {
      name: '1 Month',
      price: 999900,
      features: ['4 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions'],
      subtitle: '4 sessions • 1 hour each',
      discount_percent: 0,
    },
    {
      name: '2 Months',
      price: 1799900,
      features: ['8 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions', 'Resume review included'],
      subtitle: '8 sessions • 1 hour each',
      discount_percent: 10,
    },
    {
      name: '3 Months',
      price: 2399900,
      features: ['12 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions', 'Resume review included', 'Priority scheduling'],
      subtitle: '12 sessions • 1 hour each',
      discount_percent: 20,
    },
  ],
  USD: [
    {
      name: '1 Month',
      price: 12000,
      features: ['4 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions'],
      subtitle: '4 sessions • 1 hour each',
      discount_percent: 0,
    },
    {
      name: '2 Months',
      price: 21600,
      features: ['8 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions', 'Resume review included'],
      subtitle: '8 sessions • 1 hour each',
      discount_percent: 10,
    },
    {
      name: '3 Months',
      price: 28800,
      features: ['12 sessions (1 hr each)', 'Dedicated mentor', 'Personalized study plan', 'Chat support between sessions', 'Resume review included', 'Priority scheduling'],
      subtitle: '12 sessions • 1 hour each',
      discount_percent: 20,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                */
/* ------------------------------------------------------------------ */

const FAQItem = ({ question, answer, isOpen, onToggle, theme }) => (
  <div className={`${theme.bg.card} border ${theme.border.primary} rounded-xl overflow-hidden transition-all duration-300`}>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-5 text-left ${theme.text.primary} font-semibold hover:bg-[#06b6d4]/5 transition-colors`}
      aria-expanded={isOpen}
    >
      <span className="pr-4">{question}</span>
      <ChevronDown
        size={20}
        className={`text-[#06b6d4] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className={`px-5 pb-5 ${theme.text.secondary} text-sm leading-relaxed`}>
        {answer}
      </div>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                  */
/* ------------------------------------------------------------------ */

const PricingSkeleton = ({ theme }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`${theme.bg.card} border ${theme.border.primary} rounded-2xl p-8 animate-pulse`}>
        <div className={`h-6 ${theme.bg.tertiary} rounded w-1/2 mb-4`} />
        <div className={`h-10 ${theme.bg.tertiary} rounded w-2/3 mb-6`} />
        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className={`h-4 ${theme.bg.tertiary} rounded w-full`} />
          ))}
        </div>
        <div className={`h-12 ${theme.bg.tertiary} rounded-xl`} />
      </div>
    ))}
  </div>
);


/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */

const MentorshipPage = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { currency, currencySymbol } = useCurrency();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);

  const ctaHref = isAuthenticated ? '/mentee/mentorship' : '/register';
  const ctaLabel = isAuthenticated ? 'View My Mentorship' : 'Get Started';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(`/pricing-plans?currency=${currency}&service_type=mentorship`);
        const activePlans = (response.data || [])
          .filter((p) => p.is_active !== false)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        if (activePlans.length > 0) {
          setPlans(activePlans);
        } else {
          setPlans(fallbackPlans[currency] || fallbackPlans.INR);
        }
      } catch {
        setPlans(fallbackPlans[currency] || fallbackPlans.INR);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [currency]);

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />

      <main className="pt-20">
        {/* ---- Hero ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.gradient} relative overflow-hidden`}>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Users className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">1:1 Mentorship</span>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary} leading-tight`}>
              Your Personal <span className="text-[#06b6d4]">Interview Coach</span>, Every Step of the Way
            </h1>
            <p className={`text-lg ${theme.text.secondary} mb-10 max-w-2xl mx-auto`}>
              Get paired with a dedicated MAANG engineer who builds a personalized prep plan, tracks your progress, and coaches you through every round — from DSA to offer negotiation.
            </p>

            <Link
              to={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* ---- Features Grid ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Why <span className="text-[#06b6d4]">Mentorship</span> Works
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                One-off practice is good. A dedicated coach who knows your journey is better.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`${theme.glass} rounded-2xl p-6 border ${theme.border.primary} hover:border-[#06b6d4]/40 ${theme.shadow} transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>{feature.title}</h3>
                    <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Pricing ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Simple, Transparent <span className="text-[#06b6d4]">Pricing</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Choose the duration that fits your prep timeline. Longer plans come with bigger savings.
              </p>
            </div>

            {loadingPlans ? (
              <PricingSkeleton theme={theme} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan, index) => {
                  const price = currency === 'USD' ? (plan.price_usd ?? plan.price) : (plan.price_inr ?? plan.price);
                  const isMiddle = index === 1;
                  return (
                    <PricingTierCard
                      key={plan.plan_id || plan.name}
                      name={plan.name}
                      price={price}
                      currencySymbol={currencySymbol}
                      features={plan.features || []}
                      ctaLabel={ctaLabel}
                      ctaHref={ctaHref}
                      isPopular={isMiddle}
                      badge={isMiddle ? 'Most Popular' : undefined}
                      subtitle={plan.subtitle || `${plan.sessions_count || ''} sessions • 1 hour each`}
                      discountPercent={plan.discount_percent || 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Frequently Asked <span className="text-[#06b6d4]">Questions</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Everything you need to know about our mentorship program.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---- Bottom CTA ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4 text-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Sparkles className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Ready to Level Up?</span>
            </div>

            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
              Stop prepping alone. Get a <span className="text-[#06b6d4]">dedicated coach</span>.
            </h2>
            <p className={`text-lg ${theme.text.secondary} mb-10 max-w-xl mx-auto`}>
              Join engineers who cracked MAANG interviews with personalized mentorship. Your coach is one click away.
            </p>

            <Link
              to={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MentorshipPage;
