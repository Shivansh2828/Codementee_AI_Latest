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
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Target,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const serviceFeatures = [
  {
    icon: ShieldCheck,
    title: 'Reviewed by Senior Tech Recruiters',
    description:
      'Your resume is reviewed by recruiters who have screened thousands of candidates at top product companies.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Target,
    title: 'ATS Optimization',
    description:
      'We ensure your resume passes Applicant Tracking Systems used by MAANG and other top companies.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: MessageSquareText,
    title: 'Actionable Feedback',
    description:
      'Get specific, line-by-line suggestions — not generic advice. Walk away with a clear list of improvements.',
    color: 'from-green-400 to-emerald-500',
  },
];

const fallbackPlans = {
  INR: [
    {
      name: 'Review over Email',
      price: 149900,
      features: [
        'Detailed written feedback',
        'ATS compatibility check',
        'Formatting & structure review',
        'Delivered in 5 business days',
      ],
      subtitle: 'Async • Written feedback',
    },
    {
      name: '45-min Call',
      price: 299900,
      features: [
        'Live 1-on-1 video session',
        'Real-time resume walkthrough',
        'ATS compatibility check',
        'Personalized improvement plan',
        'Follow-up summary via email',
      ],
      subtitle: 'Live • 45-minute session',
    },
  ],
  USD: [
    {
      name: 'Review over Email',
      price: 1800,
      features: [
        'Detailed written feedback',
        'ATS compatibility check',
        'Formatting & structure review',
        'Delivered in 5 business days',
      ],
      subtitle: 'Async • Written feedback',
    },
    {
      name: '45-min Call',
      price: 3600,
      features: [
        'Live 1-on-1 video session',
        'Real-time resume walkthrough',
        'ATS compatibility check',
        'Personalized improvement plan',
        'Follow-up summary via email',
      ],
      subtitle: 'Live • 45-minute session',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                  */
/* ------------------------------------------------------------------ */

const PricingSkeleton = ({ theme }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
    {[1, 2].map((i) => (
      <div
        key={i}
        className={`${theme.bg.card} border ${theme.border.primary} rounded-2xl p-8 animate-pulse`}
      >
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

const ResumeReviewPage = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { currency, currencySymbol } = useCurrency();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const ctaHref = isAuthenticated ? '/mentee/resume-review' : '/register';
  const ctaLabel = isAuthenticated ? 'Get Your Review' : 'Get Started';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(
          `/pricing-plans?currency=${currency}&service_type=resume_review`
        );
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
        <section
          className={`py-20 md:py-28 ${theme.bg.gradient} relative overflow-hidden`}
        >
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}
            >
              <FileText className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">
                Resume Review
              </span>
            </div>

            <h1
              className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary} leading-tight`}
            >
              Get More <span className="text-[#06b6d4]">Interviews</span> With a
              Better Resume
            </h1>
            <p
              className={`text-lg ${theme.text.secondary} mb-10 max-w-2xl mx-auto`}
            >
              Your resume is your first impression. Get it reviewed by senior tech
              recruiters who know exactly what MAANG hiring managers look for — and
              what ATS systems filter out.
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

        {/* ---- Pricing ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}
              >
                Choose Your <span className="text-[#06b6d4]">Review</span> Style
              </h2>
              <p
                className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}
              >
                Whether you prefer detailed written feedback or a live walkthrough,
                we've got you covered.
              </p>
            </div>

            {loadingPlans ? (
              <PricingSkeleton theme={theme} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {plans.map((plan, index) => {
                  const price =
                    currency === 'USD'
                      ? (plan.price_usd ?? plan.price)
                      : (plan.price_inr ?? plan.price);
                  const isCall = index === 1;
                  const icon = isCall ? Phone : Mail;
                  return (
                    <PricingTierCard
                      key={plan.plan_id || plan.name}
                      name={plan.name}
                      price={price}
                      currencySymbol={currencySymbol}
                      features={plan.features || []}
                      ctaLabel={ctaLabel}
                      ctaHref={ctaHref}
                      isPopular={isCall}
                      badge={isCall ? 'Recommended' : undefined}
                      subtitle={
                        plan.subtitle ||
                        (plan.review_type === 'call'
                          ? 'Live • 45-minute session'
                          : 'Async • Written feedback')
                      }
                      discountPercent={plan.discount_percent || 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ---- Features ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}
              >
                Why Our <span className="text-[#06b6d4]">Reviews</span> Work
              </h2>
              <p
                className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}
              >
                Real feedback from people who've been on the other side of the
                hiring table.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {serviceFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`${theme.glass} rounded-2xl p-6 border ${theme.border.primary} hover:border-[#06b6d4]/40 ${theme.shadow} transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3
                      className={`text-lg font-bold ${theme.text.primary} mb-2`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm ${theme.text.secondary} leading-relaxed`}
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Bottom CTA ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4 text-center">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}
            >
              <Sparkles className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">
                Ready to Stand Out?
              </span>
            </div>

            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}
            >
              Your dream job starts with a{' '}
              <span className="text-[#06b6d4]">great resume</span>.
            </h2>
            <p
              className={`text-lg ${theme.text.secondary} mb-10 max-w-xl mx-auto`}
            >
              Don't let a weak resume hold you back. Get expert feedback and land
              more interviews at top tech companies.
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

export default ResumeReviewPage;
