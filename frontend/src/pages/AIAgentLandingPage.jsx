import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, Search, Users, Mail, ArrowRight, CheckCircle, Star, Briefcase,
  Sparkles, Crown, ChevronDown, Zap, Target, Clock, Shield, TrendingUp,
  MessageSquare, FileText, BarChart3
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../utils/api';
import { toast } from 'sonner';

const FAQItem = ({ question, answer, theme }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-5 text-left ${theme.text.primary} font-medium`}
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 ${theme.text.muted} transition-transform duration-200 shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`px-5 pb-5 ${theme.text.secondary} text-sm leading-relaxed`}>
          {answer}
        </div>
      )}
    </div>
  );
};

const AIAgentLandingPage = () => {
  const { theme, isDark } = useTheme();
  const { currency, formatPrice } = useCurrency();
  const [agentPlans, setAgentPlans] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAgentPricing();
  }, [currency]);
  
  const fetchAgentPricing = async () => {
    try {
      const response = await api.get(`/pricing-plans?currency=${currency}&service_type=ai_agent`);
      const plans = response.data;
      
      const agentPlanMap = {};
      plans.forEach(plan => {
        if (plan.plan_id === 'agent_trial') {
          agentPlanMap.trial = { price: plan.price, name: plan.name, features: plan.features };
        } else if (plan.plan_id === 'agent_monthly') {
          agentPlanMap.monthly = { price: plan.price, name: plan.name, features: plan.features };
        } else if (plan.plan_id === 'agent_quarterly') {
          agentPlanMap.quarterly = { price: plan.price, name: plan.name, features: plan.features };
        } else if (plan.plan_id === 'agent_yearly') {
          agentPlanMap.yearly = { price: plan.price, name: plan.name, features: plan.features };
        }
      });
      
      // Calculate savings dynamically
      if (agentPlanMap.monthly && agentPlanMap.quarterly) {
        agentPlanMap.quarterly.savings = (agentPlanMap.monthly.price * 3) - agentPlanMap.quarterly.price;
        agentPlanMap.quarterly.savePercent = Math.round(((agentPlanMap.monthly.price * 3 - agentPlanMap.quarterly.price) / (agentPlanMap.monthly.price * 3)) * 100);
      }
      if (agentPlanMap.monthly && agentPlanMap.yearly) {
        agentPlanMap.yearly.savings = (agentPlanMap.monthly.price * 12) - agentPlanMap.yearly.price;
        agentPlanMap.yearly.savePercent = Math.round(((agentPlanMap.monthly.price * 12 - agentPlanMap.yearly.price) / (agentPlanMap.monthly.price * 12)) * 100);
      }
      
      setAgentPlans(agentPlanMap);
    } catch (error) {
      console.error('Failed to fetch agent pricing:', error);
      toast.error('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };
  
  const getPrice = (plan) => {
    return agentPlans[plan]?.price || 0;
  };

  const faqs = [
    {
      question: 'How does the AI Job Search Agent work?',
      answer: 'You paste your resume once. Our AI extracts your skills, experience, and preferences, then searches multiple job boards daily. Each job is scored 0-100 based on how well it matches your profile. You get a daily email digest with the top matches and direct apply links.'
    },
    {
      question: 'How does the Referral Finder work?',
      answer: 'Enter any company name and a target role. The AI finds employees at that company on LinkedIn, shows their profile details (title, seniority, experience), and drafts 3 personalized referral request messages — formal, friendly, and concise — that you can copy-paste directly.'
    },
    {
      question: 'Do I need a mentorship plan to use AI Agents?',
      answer: `No. AI Agents are available as a standalone product starting at ${formatPrice(getPrice('monthly'))}/month. However, if you have an Elite mentorship plan, both agents are included for free.`
    },
    {
      question: 'What job boards does it search?',
      answer: 'The AI searches across Google Jobs, which aggregates listings from LinkedIn, Naukri, Indeed, Glassdoor, company career pages, and more — giving you the widest coverage from a single search.'
    },
    {
      question: 'Can I use this if I already have a mentorship plan?',
      answer: 'Yes. If you are on a Starter or Pro mentorship plan, you can add AI Agents as an add-on. Your role stays the same (mentee), and you get access to both agents. Elite plan members already have it included.'
    },
    {
      question: 'How often are jobs refreshed?',
      answer: 'The AI runs a daily cron job that searches for new jobs matching your profile. New matches are appended to your list, and stale listings older than 7 days are automatically cleaned up.'
    },
    {
      question: 'Is there a limit on how many jobs I can search?',
      answer: 'Each search returns up to 50 jobs across multiple pages of results. You can run searches anytime, and the daily automated search also adds new matches.'
    },
  ];
  
  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading pricing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main>
        {/* Hero Section */}
        <section className={`pt-24 pb-16 md:pt-32 md:pb-24 ${theme.bg.gradient} relative overflow-hidden`}>
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 -right-1/4 w-[500px] h-[500px] ${isDark ? 'bg-cyan-900/20' : 'bg-cyan-100'} rounded-full blur-3xl opacity-50 animate-blob`} />
            <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'} rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000`} />
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 mb-6">
                <Bot className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-sm font-semibold text-[#06b6d4]">AI-Powered Career Agents</span>
              </div>

              <h1 className={`text-4xl md:text-6xl font-bold ${theme.text.primary} mb-6 leading-tight`}>
                Your AI Agents That{' '}
                <span className="text-[#06b6d4]">Job Hunt 24/7</span>
                {' '}While You Prep
              </h1>

              <p className={`text-lg md:text-xl ${theme.text.secondary} max-w-2xl mx-auto mb-10`}>
                Stop spending hours on job boards. Let AI search jobs, score them against your resume, find referral contacts, and draft outreach messages — automatically, every day.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link
                  to="/agent-purchase?plan=agent_monthly"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                >
                  <Zap className="w-5 h-5" />
                  Start for {formatPrice(getPrice('monthly'))}/month
                </Link>
                <a
                  href="#pricing"
                  className={`inline-flex items-center gap-2 px-8 py-4 ${theme.button.secondary} rounded-xl transition-all duration-300`}
                >
                  View All Plans
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                {[
                  { icon: Shield, text: 'No fake listings' },
                  { icon: Clock, text: 'Daily automated search' },
                  { icon: Target, text: 'AI-scored matches' },
                ].map((badge, i) => (
                  <div key={i} className={`flex items-center gap-2 ${theme.text.muted}`}>
                    <badge.icon className="w-4 h-4 text-[#06b6d4]" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Two Agents Detail Section */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-4`}>
                2 Agents. <span className="text-[#06b6d4]">One Mission.</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
                Each agent handles a different part of your job search so you can focus on what matters — interview prep.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Job Search Agent — Detailed */}
              <div className={`rounded-2xl ${theme.bg.card} ${theme.border.primary} border overflow-hidden`}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
                      <Search className="w-7 h-7 text-[#06b6d4]" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${theme.text.primary}`}>AI Job Search Agent</h3>
                      <span className={`text-sm ${theme.text.muted}`}>Your personal job hunter</span>
                    </div>
                  </div>

                  <p className={`${theme.text.secondary} mb-6 leading-relaxed`}>
                    Paste your resume once. The AI extracts your skills, experience level, and preferences, then searches across Google Jobs (which aggregates LinkedIn, Naukri, Indeed, Glassdoor, and company career pages) every single day.
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: FileText, title: 'Resume Parsing', desc: 'AI extracts skills, experience, education, and target roles from your resume automatically' },
                      { icon: BarChart3, title: 'Smart Scoring (0-100)', desc: 'Every job is scored against your profile — skill match, experience fit, location, and salary range' },
                      { icon: Mail, title: 'Daily Email Digest', desc: 'Wake up to a curated list of your top job matches delivered to your inbox' },
                      { icon: Target, title: 'No Fake Listings', desc: 'AI detects and filters out fake/spam job postings so you only see legitimate opportunities' },
                      { icon: TrendingUp, title: 'Up to 50 Results', desc: 'Paginates across multiple pages to find the widest range of matching jobs' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-[#06b6d4]" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${theme.text.primary}`}>{item.title}</p>
                          <p className={`text-sm ${theme.text.muted}`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sample match card */}
                  <div className={`${theme.bg.secondary} rounded-xl p-5 ${theme.border.primary} border`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs ${theme.text.muted} uppercase tracking-wider font-semibold`}>Sample Match</span>
                      <span className="text-sm font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">92/100</span>
                    </div>
                    <p className={`font-semibold ${theme.text.primary}`}>SDE-2 at Razorpay</p>
                    <p className={`text-sm ${theme.text.muted} mt-1`}>Bangalore · ₹28-42 LPA · Skills: 5/6 match</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">React</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">Node.js</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">MongoDB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Finder Agent — Detailed */}
              <div className={`rounded-2xl ${theme.bg.card} ${theme.border.primary} border overflow-hidden`}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-[#06b6d4]" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${theme.text.primary}`}>AI Referral Finder</h3>
                      <span className={`text-sm ${theme.text.muted}`}>LinkedIn-powered outreach</span>
                    </div>
                  </div>

                  <p className={`${theme.text.secondary} mb-6 leading-relaxed`}>
                    Enter a company name and target role. The AI finds employees at that company on LinkedIn, enriches their profiles with experience, skills, and education, then drafts 3 personalized referral request messages.
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Users, title: 'LinkedIn Profile Discovery', desc: 'Finds employees at your target company filtered by role — engineers, managers, recruiters' },
                      { icon: MessageSquare, title: '3 Message Drafts', desc: 'AI writes formal, friendly, and concise referral request messages personalized to each contact' },
                      { icon: FileText, title: 'Enriched Profiles', desc: 'See experience, skills, education, current role, and LinkedIn URL for each contact' },
                      { icon: Briefcase, title: 'Job ID & Link Placeholders', desc: 'Messages include placeholders for the specific job you are applying to' },
                      { icon: Star, title: 'One-Click Copy', desc: 'Copy any message with a single click and send it directly via LinkedIn' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-[#06b6d4]" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${theme.text.primary}`}>{item.title}</p>
                          <p className={`text-sm ${theme.text.muted}`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sample referral card */}
                  <div className={`${theme.bg.secondary} rounded-xl p-5 ${theme.border.primary} border`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs ${theme.text.muted} uppercase tracking-wider font-semibold`}>Sample Referral</span>
                      <span className="text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-3 py-1 rounded-full">✅ Profile Found</span>
                    </div>
                    <p className={`font-semibold ${theme.text.primary}`}>Priya Sharma — SDE-3 at Google</p>
                    <p className={`text-sm ${theme.text.muted} mt-1`}>Engineering · 6 yrs exp · IIT Delhi</p>
                    <div className={`mt-3 p-3 rounded-lg ${theme.bg.card} ${theme.border.primary} border text-sm ${theme.text.secondary} italic`}>
                      "Hi Priya, I came across your profile and was impressed by your work at Google. I'm applying for the SDE-2 role (Job ID: [JOB_ID]) and would love a referral..."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-4`}>
                How It <span className="text-[#06b6d4]">Works</span>
              </h2>
              <p className={`text-lg ${theme.text.secondary}`}>
                From signup to your first job match in under 5 minutes.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: '1', icon: FileText, title: 'Upload Your Resume', desc: 'Upload your resume (PDF/DOCX). AI extracts skills, experience, and preferences.' },
                  { step: '2', icon: Bot, title: 'AI Searches Daily', desc: 'Every day, your agent searches job boards and scores matches against your profile.' },
                  { step: '3', icon: Mail, title: 'Get Email Digest', desc: 'Top matches land in your inbox each morning with scores and direct apply links.' },
                  { step: '4', icon: Users, title: 'Find Referrals', desc: 'Pick a company, get LinkedIn contacts and AI-drafted referral messages instantly.' },
                ].map((item, i) => (
                  <div key={i} className="relative text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center relative`}>
                      <item.icon className="w-7 h-7 text-[#06b6d4]" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#06b6d4] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h4 className={`font-semibold ${theme.text.primary} mb-2`}>{item.title}</h4>
                    <p className={`text-sm ${theme.text.muted} leading-relaxed`}>{item.desc}</p>
                    {i < 3 && (
                      <ArrowRight className={`hidden md:block absolute top-8 -right-3 w-5 h-5 ${theme.text.muted} opacity-40`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-4`}>
                Simple, <span className="text-[#06b6d4]">Affordable</span> Pricing
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-lg mx-auto`}>
                One product. Pick your billing cycle. Longer = cheaper.
              </p>
            </div>

            {/* Features — shown once */}
            <div className="max-w-md mx-auto mb-10">
              <p className={`text-xs font-semibold ${theme.text.muted} uppercase tracking-wider mb-4 text-center`}>Everything included</p>
              <div className="grid grid-cols-1 gap-2.5">
                {['AI Job Search Agent — daily automated search', 'AI Referral Finder — LinkedIn contacts + message drafts', 'Daily email digest with scored matches', 'Resume parsing & smart scoring (0-100)', 'Fake listing detection & filtering'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                    <span className={`text-sm ${theme.text.secondary}`}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration cards — price only, no repeated features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto mb-12">
              {/* Trial — One-time */}
              <div className={`rounded-2xl p-6 ${theme.bg.card} ${theme.border.primary} border hover:border-amber-500/40 transition-all duration-300 text-center relative`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">Try It Out</span>
                </div>
                <h4 className={`text-lg font-bold ${theme.text.primary} mb-1 mt-1`}>Trial</h4>
                <p className={`text-[11px] ${theme.text.muted} mb-4`}>One-time • 1 month only</p>
                <div className="flex items-baseline justify-center gap-1 mb-5">
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>{formatPrice(getPrice('trial'))}</span>
                </div>
                <Link
                  to="/agent-purchase?plan=agent_trial"
                  className={`block w-full text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} hover:border-amber-500/50`}
                >
                  Start Trial
                </Link>
              </div>

              {/* Monthly */}
              <div className={`rounded-2xl p-6 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300 text-center`}>
                <h4 className={`text-lg font-bold ${theme.text.primary} mb-1`}>Monthly</h4>
                <p className={`text-[11px] ${theme.text.muted} mb-4`}>Billed every month</p>
                <div className="flex items-baseline justify-center gap-1 mb-5">
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>{formatPrice(getPrice('monthly'))}</span>
                  <span className={`${theme.text.muted} text-sm`}>/mo</span>
                </div>
                <Link
                  to="/agent-purchase?plan=agent_monthly"
                  className={`block w-full text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} hover:border-[#06b6d4]/50`}
                >
                  Get Monthly
                </Link>
              </div>

              {/* Quarterly — Popular */}
              <div className="rounded-2xl p-6 bg-gradient-to-b from-[#06b6d4]/10 to-transparent border-2 border-[#06b6d4]/40 relative text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#06b6d4] text-white text-[10px] font-bold rounded-full shadow-lg">Best Value</span>
                </div>
                <h4 className={`text-lg font-bold ${theme.text.primary} mb-1 mt-1`}>Quarterly</h4>
                <p className={`text-[11px] ${theme.text.muted} mb-4`}>Billed every 3 months</p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>{formatPrice(getPrice('quarterly'))}</span>
                  <span className={`${theme.text.muted} text-sm`}>/3 mo</span>
                </div>
                <p className={`text-[11px] mb-1 ${theme.text.muted}`}>~{formatPrice(Math.round(getPrice('quarterly') / 3))}/mo</p>
                {agentPlans.quarterly?.savePercent > 0 && (
                  <p className="text-[11px] font-semibold text-green-500 mb-4">Save {agentPlans.quarterly.savePercent}%</p>
                )}
                <Link
                  to="/agent-purchase?plan=agent_quarterly"
                  className="block w-full text-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#06b6d4] text-white hover:bg-[#0891b2] transition-all duration-200 shadow-lg"
                >
                  Get Quarterly
                </Link>
              </div>

              {/* Yearly */}
              <div className={`rounded-2xl p-6 ${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/40 transition-all duration-300 text-center`}>
                <h4 className={`text-lg font-bold ${theme.text.primary} mb-1`}>Yearly</h4>
                <p className={`text-[11px] ${theme.text.muted} mb-4`}>Billed annually</p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>{formatPrice(getPrice('yearly'))}</span>
                  <span className={`${theme.text.muted} text-sm`}>/yr</span>
                </div>
                <p className={`text-[11px] mb-1 ${theme.text.muted}`}>~{formatPrice(Math.round(getPrice('yearly') / 12))}/mo</p>
                {agentPlans.yearly?.savePercent > 0 && (
                  <p className="text-[11px] font-semibold text-green-500 mb-4">Save {agentPlans.yearly.savePercent}%</p>
                )}
                <Link
                  to="/agent-purchase?plan=agent_yearly"
                  className={`block w-full text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} hover:border-[#06b6d4]/50`}
                >
                  Get Yearly
                </Link>
              </div>
            </div>

            {/* Elite callout */}
            <div className="max-w-2xl mx-auto">
              <div className={`${theme.bg.card} border-2 border-amber-500/30 rounded-2xl p-8 text-center`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className={`font-bold ${theme.text.primary}`}>Already on Elite Plan?</span>
                </div>
                <p className={`${theme.text.secondary} mb-5 text-sm`}>
                  Both AI agents are included free with your Elite mentorship plan. No extra purchase needed.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
                >
                  <Crown className="w-4 h-4" />
                  Get Elite Access
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`py-20 md:py-28 ${theme.bg.primary}`}>
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-4`}>
                  Frequently Asked <span className="text-[#06b6d4]">Questions</span>
                </h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.question} answer={faq.answer} theme={theme} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Bot className="w-16 h-16 text-[#06b6d4] mx-auto mb-6" />
              <h2 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-4`}>
                Stop Searching. Start Getting Matched.
              </h2>
              <p className={`text-lg ${theme.text.secondary} max-w-xl mx-auto mb-8`}>
                Let your AI agents do the heavy lifting while you focus on cracking the interview.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/agent-purchase?plan=agent_monthly"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-300 shadow-lg text-lg"
                >
                  <Zap className="w-5 h-5" />
                  Start for {formatPrice(getPrice('monthly'))}/mo
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center gap-2 px-8 py-4 ${theme.button.secondary} rounded-xl transition-all duration-300`}
                >
                  Or Get Elite Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AIAgentLandingPage;
