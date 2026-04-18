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
  Clock,
  Video,
  FileText,
  Code,
  Server,
  MessageSquare,
  Users,
  CheckCircle,
  Shield,
  Star,
  Briefcase,
  Target,
  BarChart3,
  BookOpen,
  Award,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Static data for this page                                         */
/* ------------------------------------------------------------------ */

const sessionTimeline = [
  {
    icon: BookOpen,
    title: 'Prep Material Shared',
    duration: '24 hrs before',
    description: 'Receive company-specific prep guide and focus areas.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Video,
    title: 'Live Interview',
    duration: '45–90 min',
    description: '1-on-1 session with a MAANG engineer over Google Meet.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: FileText,
    title: 'Feedback Delivered',
    duration: 'Within 48 hrs',
    description: 'Detailed written report with scores, improvement areas, and next steps.',
    color: 'from-orange-400 to-amber-500',
  },
];

const interviewTypes = [
  {
    icon: Code,
    title: 'Coding',
    duration: '60–90 min',
    description: 'Data structures, algorithms, and problem-solving — just like the real thing.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Server,
    title: 'System Design',
    duration: '45–60 min',
    description: 'Architecture, scalability, and distributed systems deep-dives.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'Behavioral',
    duration: '30–45 min',
    description: 'Leadership, teamwork, and problem-solving scenarios using STAR framework.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Briefcase,
    title: 'HR Round',
    duration: '30–45 min',
    description: 'Culture fit, salary negotiation, and company-specific questions.',
    color: 'from-orange-400 to-amber-500',
  },
];

const exampleQuestions = {
  Coding: [
    'Design an LRU Cache',
    'Median of Two Sorted Arrays',
    'Serialize and Deserialize a Binary Tree',
  ],
  'System Design': [
    'Design a URL Shortening Service',
    'Design a Chat Application',
    'Design a Rate Limiter',
  ],
  Behavioral: [
    'Tell me about a time you handled ambiguity',
    'Describe a project where you had to influence without authority',
    'How do you prioritize competing deadlines?',
  ],
  'HR Round': [
    'Why do you want to join this company?',
    'What are your salary expectations?',
    'Where do you see yourself in 5 years?',
  ],
};

const deliverables = [
  { icon: BarChart3, text: 'Detailed feedback report with section-wise scores' },
  { icon: Target, text: 'Specific improvement areas and weak-spot analysis' },
  { icon: FileText, text: 'Actionable study roadmap tailored to your level' },
  { icon: Video, text: 'Session recording for self-review' },
];

const credibilityPoints = [
  'Interviewers from Amazon, Google, Microsoft, Meta & more',
  '5+ years average industry experience',
  'Conducted 500+ mock interviews collectively',
  'Active hiring committee members at top companies',
];

const fallbackPlans = {
  INR: [
    {
      name: 'Starter',
      price: 249900,
      features: ['1 Mock Interview', 'Detailed feedback report', 'Session recording', 'Study roadmap'],
      subtitle: '1 session',
    },
    {
      name: 'Pro',
      price: 699900,
      features: ['3 Mock Interviews', 'Detailed feedback reports', 'Session recordings', 'Study roadmap', 'Resume review'],
      subtitle: '3 sessions',
    },
    {
      name: 'Elite',
      price: 999900,
      features: ['6 Mock Interviews', 'Detailed feedback reports', 'Session recordings', 'Study roadmap', 'Resume review', 'Priority scheduling'],
      subtitle: '6 sessions',
    },
  ],
  USD: [
    {
      name: 'Starter',
      price: 1900,
      features: ['1 Mock Interview', 'Detailed feedback report', 'Session recording', 'Study roadmap'],
      subtitle: '1 session',
    },
    {
      name: 'Pro',
      price: 4500,
      features: ['3 Mock Interviews', 'Detailed feedback reports', 'Session recordings', 'Study roadmap', 'Resume review'],
      subtitle: '3 sessions',
    },
    {
      name: 'Elite',
      price: 12300,
      features: ['6 Mock Interviews', 'Detailed feedback reports', 'Session recordings', 'Study roadmap', 'Resume review', 'Priority scheduling'],
      subtitle: '6 sessions',
    },
  ],
};

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
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

const MockInterviewPage = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { currency, currencySymbol } = useCurrency();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const isPaidUser = isAuthenticated && user?.plan_id && !user?.plan_id?.startsWith('agent_');
  const ctaHref = isPaidUser ? '/mentee/slots' : '/register';
  const ctaLabel = isPaidUser ? 'Book a Session' : 'Start Practicing';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(`/pricing-plans?currency=${currency}&service_type=mock_interview`);
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
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Video className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Mock Interviews</span>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-6 ${theme.text.primary} leading-tight`}>
              Practice with <span className="text-[#06b6d4]">MAANG Engineers</span>. Get Real Feedback.
            </h1>
            <p className={`text-lg ${theme.text.secondary} mb-10 max-w-2xl mx-auto`}>
              Simulate the exact interview experience at top product companies — coding, system design, behavioral, and HR rounds — with engineers who've been on the other side of the table.
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

        {/* ---- Session Timeline ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                What a Session <span className="text-[#06b6d4]">Looks Like</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                From prep to feedback — here's the full timeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {sessionTimeline.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`${theme.glass} rounded-2xl p-8 border ${theme.border.primary} ${theme.shadow} text-center hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-5`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#06b6d4] tracking-widest uppercase block mb-2">
                      {step.duration}
                    </span>
                    <h3 className={`text-xl font-bold ${theme.text.primary} mb-3`}>{step.title}</h3>
                    <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Interview Types Grid ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Interview <span className="text-[#06b6d4]">Types</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Choose the round you want to practice — we cover every stage of the interview loop.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {interviewTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.title}
                    className={`${theme.glass} rounded-2xl p-6 border ${theme.border.primary} hover:border-[#06b6d4]/40 ${theme.shadow} transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.text.primary} mb-1`}>{type.title}</h3>
                    <span className={`text-xs ${theme.text.muted} block mb-3`}>
                      <Clock className="w-3 h-3 inline mr-1" />{type.duration}
                    </span>
                    <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{type.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Example Questions by Type ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Example <span className="text-[#06b6d4]">Questions</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Real questions from FAANG-level interviews, grouped by round.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.entries(exampleQuestions).map(([type, questions]) => (
                <div
                  key={type}
                  className={`${theme.glass} rounded-2xl p-6 border ${theme.border.primary} ${theme.shadow}`}
                >
                  <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>{type}</h3>
                  <ul className="space-y-3">
                    {questions.map((q) => (
                      <li key={q} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-[#06b6d4] mt-0.5 shrink-0" />
                        <span className={`text-sm ${theme.text.secondary}`}>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Mentor Credibility ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
                <Shield className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-sm font-semibold text-[#06b6d4]">Vetted Interviewers</span>
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                Learn from <span className="text-[#06b6d4]">the Best</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} mb-10 max-w-2xl mx-auto`}>
                Every interviewer on Codementee is a working engineer at a top product company.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                {credibilityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-[#06b6d4] mt-0.5 shrink-0" />
                    <span className={`text-sm ${theme.text.secondary}`}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- What You Get ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
                What You <span className="text-[#06b6d4]">Get</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Clear deliverables after every session. No fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {deliverables.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className={`flex items-start gap-4 ${theme.glass} rounded-xl p-5 border ${theme.border.primary} hover:border-[#06b6d4]/30 transition-all duration-300`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#06b6d4] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm ${theme.text.secondary} leading-relaxed pt-2`}>{item.text}</span>
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
                Choose Your <span className="text-[#06b6d4]">Plan</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Pick the plan that matches your prep intensity. Every plan includes real interviews with MAANG engineers.
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
                      subtitle={plan.subtitle}
                      discountPercent={plan.discount_percent || 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ---- Bottom CTA ---- */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container mx-auto px-4 text-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${theme.bg.card} border border-[#06b6d4]/40`}>
              <Award className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm font-semibold text-[#06b6d4]">Ready to Practice?</span>
            </div>

            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text.primary}`}>
              Your next interview doesn't have to be a <span className="text-[#06b6d4]">surprise</span>.
            </h2>
            <p className={`text-lg ${theme.text.secondary} mb-10 max-w-xl mx-auto`}>
              Practice with real engineers. Get honest feedback. Walk in prepared.
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

export default MockInterviewPage;
