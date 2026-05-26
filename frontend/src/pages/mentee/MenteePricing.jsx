import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useFoundingSlots } from '../../hooks/useFoundingSlots';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import CouponCodeInput from "../../components/pricing/CouponCodeInput";
import { toast } from "sonner";
import { 
  Check, 
  X,
  Crown, 
  Sparkles,
  TrendingUp,
  Loader2,
  Shield,
  Award,
  Users
} from "lucide-react";
import api from "../../utils/api";

const MenteePricing = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { currency, currencySymbol } = useCurrency();
  const { remaining, total, sold_out } = useFoundingSlots(30000);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [coursePlans, setCoursePlans] = useState([]);
  const [mentorshipPlans, setMentorshipPlans] = useState([]);
  const [resumeReviewPlans, setResumeReviewPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return ['mock', 'mentorship', 'resume', 'courses'].includes(tab) ? tab : 'mock';
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponPlanId, setCouponPlanId] = useState(null);

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  const currentPlanId = user?.plan_id;

  // Tier hierarchy for upgrade path logic
  const tierOrder = { starter: 1, pro: 2, elite: 3 };

  const isHigherTier = (planId) => {
    if (!currentPlanId || isFreeUser) return false;
    return (tierOrder[planId] || 0) > (tierOrder[currentPlanId] || 0);
  };

  const isOnHighestTier = currentPlanId === 'elite';

  // Plan configuration matching landing page
  const planConfig = {
    'starter': {
      icon: Sparkles,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      description: 'Best for engineers who want a structured evaluation before real interviews.',
      cta: 'Get Evaluated',
      popular: false
    },
    'pro': {
      icon: TrendingUp,
      iconColor: 'text-[#06b6d4]',
      bgColor: 'bg-[#06b6d4]/20',
      description: 'Complete preparation cycle before product company interviews.',
      cta: 'Start Full Prep',
      popular: true,
      badge: 'Most Popular'
    },
    'elite': {
      icon: Crown,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      description: 'High-touch preparation for Tier-1 / MAANG aspirants.',
      cta: 'Go Elite',
      popular: false
    }
  };

  const featureMatrix = [
    { feature: "MAANG-Level Mock Interviews", starter: "1", pro: "3", elite: "6" },
    { feature: "Detailed Feedback Report", starter: true, pro: true, elite: true },
    { feature: "Resume Review (Email-based)", starter: true, pro: false, elite: false },
    { feature: "Resume Review by MAANG Engineer", starter: false, pro: true, elite: false },
    { feature: "Live Resume Review Session", starter: false, pro: false, elite: true },
    { feature: "Strategy Call", starter: false, pro: "1", elite: false },
    { feature: "Proven Resume Templates", starter: true, pro: true, elite: true },
    { feature: "AI ATS Resume Checker", starter: true, pro: true, elite: true },
    { feature: "Improvement Tracking", starter: false, pro: true, elite: true },
    { feature: "Referral Guidance", starter: false, pro: false, elite: true },
    { feature: "Priority WhatsApp Support", starter: false, pro: false, elite: true },
  ];

  const renderCellValue = (value) => {
    if (typeof value === 'string') {
      return <span className={`text-sm font-semibold ${theme.text.primary}`}>{value}</span>;
    }
    if (value === true) {
      return <Check className="w-5 h-5 text-emerald-400 mx-auto" strokeWidth={3} />;
    }
    return <X className="w-5 h-5 text-gray-500/50 mx-auto" strokeWidth={2} />;
  };

  useEffect(() => {
    fetchPricingPlans();
    fetchCoursePlans();
    fetchMentorshipPlans();
    fetchResumeReviewPlans();
  }, [currency]);

  const fetchPricingPlans = async () => {
    try {
      const response = await api.get('/pricing-plans', {
        params: {
          currency,
          service_type: 'mock_interview'
        }
      });
      
      // Only show the 3 main mock interview tiers
      const allowedPlanIds = ['starter', 'pro', 'elite'];
      
      // Map and sort plans
      const mappedPlans = response.data
        .filter(plan => {
          const planId = plan.plan_id || plan.id;
          return plan.is_active !== false && allowedPlanIds.includes(planId);
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(plan => {
          const planId = plan.plan_id || plan.id;
          const config = planConfig[planId] || planConfig['starter'];
          
          return {
            ...plan,
            id: planId,
            plan_id: planId,
            config
          };
        });
      
      setPlans(mappedPlans);
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursePlans = async () => {
    try {
      const response = await api.get('/pricing-plans', {
        params: { currency, service_type: 'course' }
      });
      const courseConfig = {
        devops_course:     { color: 'text-orange-400', bg: 'bg-orange-400/20', border: 'border-orange-500', badge: null },
        aws_course:        { color: 'text-orange-400', bg: 'bg-orange-400/20', border: 'border-orange-500', badge: null },
        devops_aws_bundle: { color: 'text-amber-400',  bg: 'bg-amber-400/20',  border: 'border-amber-500',  badge: 'Best Value' },
      };
      const mapped = response.data
        .filter(p => p.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(p => ({ ...p, plan_id: p.plan_id || p.id, config: courseConfig[p.plan_id] || courseConfig.devops_course }));
      setCoursePlans(mapped);
    } catch (error) {
      console.error('Failed to fetch course plans:', error);
    }
  };

  const fetchMentorshipPlans = async () => {
    try {
      const response = await api.get('/pricing-plans', {
        params: { currency, service_type: 'mentorship' }
      });
      const mentorshipConfig = {
        starter_mentorship: { icon: Sparkles, iconColor: 'text-blue-400', bgColor: 'bg-blue-400/20', cta: 'Get Started' },
        pro_mentorship:     { icon: TrendingUp, iconColor: 'text-[#06b6d4]', bgColor: 'bg-[#06b6d4]/20', cta: 'Upgrade', popular: true },
        elite_mentorship:   { icon: Crown, iconColor: 'text-amber-400', bgColor: 'bg-amber-400/20', cta: 'Go Elite' },
      };
      const mapped = response.data
        .filter(p => p.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(p => ({ ...p, plan_id: p.plan_id || p.id, config: mentorshipConfig[p.plan_id] || mentorshipConfig.starter_mentorship }));
      setMentorshipPlans(mapped);
    } catch (error) {
      console.error('Failed to fetch mentorship plans:', error);
    }
  };

  const fetchResumeReviewPlans = async () => {
    try {
      const response = await api.get('/pricing-plans', {
        params: { currency, service_type: 'resume_review' }
      });
      const resumeConfig = {
        starter_resume: { color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-500', badge: null },
        pro_resume:     { color: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/20', border: 'border-[#06b6d4]', badge: 'Live Call' },
        elite_resume:   { color: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-500', badge: 'Premium' },
      };
      const mapped = response.data
        .filter(p => p.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(p => ({ ...p, plan_id: p.plan_id || p.id, config: resumeConfig[p.plan_id] || resumeConfig.starter_resume }));
      setResumeReviewPlans(mapped);
    } catch (error) {
      console.error('Failed to fetch resume review plans:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    if (processingPlan) return;
    
    setProcessingPlan(plan.plan_id);

    try {
      // Create order
      const orderResponse = await api.post('/payment/create-order', {
        plan_id: plan.plan_id,
        name: user.name,
        email: user.email,
        current_role: user.current_role || '',
        target_role: user.target_role || '',
        is_upgrade: !isFreeUser,
        coupon_code: (couponPlanId === plan.plan_id && appliedCoupon?.code) || undefined,
      });

      const orderData = orderResponse.data;
      const payment_gateway = orderData.payment_gateway;

      if (payment_gateway === 'razorpay') {
        // Handle Razorpay payment (India)
        const { order_id, razorpay_order_id, amount, razorpay_key_id } = orderData;

        const options = {
          key: razorpay_key_id,
          amount: amount,
          currency: 'INR',
          name: 'Codementee',
          description: `${plan.name} Plan`,
          order_id: razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyResponse = await api.post('/payment/verify', {
                order_id: order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.data.success) {
                toast.success('Payment successful! Your account has been upgraded.');
                localStorage.setItem('token', verifyResponse.data.access_token);
                
                setTimeout(() => {
                  window.location.href = '/mentee';
                }, 1500);
              }
            } catch (error) {
              toast.error('Payment verification failed');
              setProcessingPlan(null);
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#06b6d4'
          },
          modal: {
            ondismiss: function() {
              setProcessingPlan(null);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else if (payment_gateway === 'cashfree') {
        // Handle Cashfree payment (International)
        const { order_id, payment_session_id } = orderData;

        const cashfree = new window.Cashfree({
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        cashfree.checkout({
          paymentSessionId: payment_session_id,
          returnUrl: `${window.location.origin}/payment/success?order_id=${order_id}`,
          redirectTarget: '_self'
        }).then(() => {
          // Payment initiated successfully
          console.log('Cashfree payment initiated');
        }).catch((error) => {
          console.error('Cashfree payment error:', error);
          toast.error('Failed to initiate payment');
          setProcessingPlan(null);
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pricing Plans">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#06b6d4]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pricing Plans">
      <div className="space-y-8">
        {/* Tab switcher */}
        <div className="flex justify-center overflow-x-auto">
          <div className={`inline-flex rounded-xl p-1 ${theme.bg.secondary} border ${theme.border.primary}`}>
            <button
              onClick={() => setActiveTab('mock')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'mock'
                  ? 'bg-[#06b6d4] text-white shadow-lg'
                  : `${theme.text.secondary} hover:${theme.text.primary}`
              }`}
            >
              Mock Interviews
            </button>
            <button
              onClick={() => setActiveTab('mentorship')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'mentorship'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : `${theme.text.secondary} hover:${theme.text.primary}`
              }`}
            >
              Mentorship
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'resume'
                  ? 'bg-green-500 text-white shadow-lg'
                  : `${theme.text.secondary} hover:${theme.text.primary}`
              }`}
            >
              Resume Review
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : `${theme.text.secondary} hover:${theme.text.primary}`
              }`}
            >
              Courses
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className={`text-4xl font-bold ${theme.text.primary} mb-4`}>
            Choose Your Plan
          </h1>
          <p className={`${theme.text.secondary} text-lg`}>
            Select the perfect plan to accelerate your interview preparation journey
          </p>
        </div>

        {/* Current Plan Notice */}
        {!isFreeUser && (
          <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl p-4 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-[#06b6d4]" />
              <p className={theme.text.primary}>
                You're currently on the <span className="font-bold">{user?.plan_name || 'Active'}</span> plan
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards - Mock Interviews */}
        {activeTab === 'mock' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.config.icon;
            const isCurrentPlan = currentPlanId === plan.plan_id;
            const isProcessing = processingPlan === plan.plan_id;
            const isPopular = plan.config.popular;
            const isUpgrade = isHigherTier(plan.plan_id);
            const isHighestTierCard = plan.plan_id === 'elite' && isOnHighestTier;
            
            return (
              <div
                key={plan.plan_id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isCurrentPlan
                    ? `${theme.bg.card} border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10`
                    : isPopular
                    ? `${theme.bg.card} border-2 border-[#06b6d4] shadow-2xl shadow-[#06b6d4]/20 md:scale-105 md:-mt-4 md:mb-4`
                    : `${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/50`
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Popular Badge */}
                {isPopular && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                    {plan.config.badge}
                  </div>
                )}

                <div className={`p-8 ${isCurrentPlan ? 'pt-12' : ''}`}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${plan.config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${plan.config.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-2xl font-bold ${theme.text.primary}`}>
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${theme.text.secondary} mb-6 leading-relaxed`}>
                    {plan.config.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg ${theme.text.secondary}`}>{currencySymbol}</span>
                      <span className={`text-5xl font-bold ${theme.text.primary}`}>
                        {currency === 'USD' 
                          ? Math.floor(plan.price / 100).toLocaleString('en-US')
                          : Math.floor(plan.price / 100).toLocaleString('en-IN')
                        }
                      </span>
                    </div>
                    <p className={`text-sm ${theme.text.muted} mt-2`}>
                      One-Time Payment
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features && plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPopular ? 'bg-[#06b6d4]' : `${theme.bg.secondary}`
                        }`}>
                          <Check 
                            size={12} 
                            className={isPopular ? 'text-white' : 'text-[#06b6d4]'} 
                            strokeWidth={3}
                          />
                        </div>
                        <span className={`text-sm ${theme.text.secondary}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Coupon Code */}
                  <div className="mb-4">
                    <CouponCodeInput
                      serviceType={plan.service_type || "mock_interview"}
                      orderAmount={plan.price}
                      currency={currency}
                      onCouponApplied={(result) => {
                        setAppliedCoupon(result);
                        setCouponPlanId(plan.plan_id);
                      }}
                      onCouponRemoved={() => {
                        setAppliedCoupon(null);
                        setCouponPlanId(null);
                      }}
                    />
                  </div>

                  {/* Highest Tier Indicator */}
                  {isHighestTierCard && (
                    <div className="flex items-center justify-center gap-2 mb-4 py-2 px-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">
                        Highest Tier — You're at the top!
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || isProcessing}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-emerald-600/80 cursor-not-allowed text-white'
                        : isUpgrade
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white shadow-lg shadow-[#06b6d4]/30'
                        : isPopular
                        ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/30'
                        : `${theme.bg.secondary} ${theme.text.primary} hover:bg-[#06b6d4] hover:text-white border ${theme.border.primary}`
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="w-4 h-4" />
                        Current Plan
                      </>
                    ) : isUpgrade ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Upgrade
                      </>
                    ) : (
                      plan.config.cta
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        )} {/* end activeTab === 'mock' */}

        {/* Course Cards */}
        {activeTab === 'courses' && (
        <div className="max-w-4xl mx-auto">
          {coursePlans.length === 0 ? (
            <div className={`text-center py-12 ${theme.text.muted}`}>
              <p className="text-lg mb-2">Course plans coming soon</p>
              <p className="text-sm">Check back shortly or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coursePlans.map((plan) => {
                const isProcessing = processingPlan === plan.plan_id;
                const userCourses = Array.isArray(user?.course_access) ? user.course_access : [];
                const planCourses = plan.limits?.course_access || [];
                const alreadyOwned = planCourses.length > 0 && planCourses.every(c => userCourses.includes(c));
                return (
                  <div key={plan.plan_id} className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${theme.bg.card} ${
                    plan.config.badge ? 'border-amber-500 shadow-xl shadow-amber-500/20' : 'border-orange-500/50 hover:border-orange-500'
                  }`}>
                    {plan.config.badge && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                        {plan.config.badge}
                      </div>
                    )}
                    {alreadyOwned && (
                      <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          Already Owned
                        </div>
                      </div>
                    )}
                    <div className={`p-7 ${alreadyOwned ? 'pt-12' : ''}`}>
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className={`text-lg ${theme.text.secondary}`}>{currencySymbol}</span>
                        <span className={`text-4xl font-bold ${theme.text.primary}`}>
                          {Math.floor(plan.price / 100).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-sm ${theme.text.muted} ml-1`}>one-time</span>
                      </div>
                      <ul className="space-y-2.5 mb-6">
                        {(plan.features || []).map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={10} className="text-orange-400" strokeWidth={3} />
                            </div>
                            <span className={`text-sm ${theme.text.secondary}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleUpgrade(plan)}
                        disabled={alreadyOwned || isProcessing}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          alreadyOwned
                            ? 'bg-emerald-600/80 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30'
                        }`}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : alreadyOwned ? (
                          <><Check className="w-4 h-4" /> Owned</>
                        ) : (
                          `Buy Now — ${currencySymbol}${Math.floor(plan.price / 100)}`
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className={`text-center text-sm ${theme.text.muted} mt-6`}>
            One-time payment · Lifetime access · Also included in Pro and Elite plans
          </p>
        </div>
        )} {/* end activeTab === 'courses' */}

        {/* Mentorship Cards */}
        {activeTab === 'mentorship' && (
        <div className="max-w-4xl mx-auto">
          {mentorshipPlans.length === 0 ? (
            <div className={`text-center py-12 ${theme.text.muted}`}>
              <p className="text-lg mb-2">Mentorship plans coming soon</p>
              <p className="text-sm">Check back shortly or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mentorshipPlans.map((plan) => {
                const Icon = plan.config.icon;
                const isProcessing = processingPlan === plan.plan_id;
                const isPopular = plan.config.popular;
                
                return (
                  <div key={plan.plan_id} className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${theme.bg.card} ${
                    isPopular ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-purple-500/50 hover:border-purple-500'
                  }`}>
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <div className="p-7">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl ${plan.config.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${plan.config.iconColor}`} />
                        </div>
                        <h3 className={`text-xl font-bold ${theme.text.primary}`}>{plan.name}</h3>
                      </div>
                      
                      <p className={`text-sm ${theme.text.secondary} mb-6`}>{plan.description}</p>
                      
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className={`text-lg ${theme.text.secondary}`}>{currencySymbol}</span>
                        <span className={`text-4xl font-bold ${theme.text.primary}`}>
                          {Math.floor(plan.price / 100).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-sm ${theme.text.muted} ml-1`}>one-time</span>
                      </div>

                      {/* Mentorship Details */}
                      {(plan.sessions_count || plan.session_duration_minutes) && (
                        <div className={`space-y-2 mb-6 p-3 rounded-lg ${theme.bg.secondary}`}>
                          {plan.sessions_count && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Sessions:</span>
                              <span className="font-semibold text-purple-400">{plan.sessions_count}</span>
                            </div>
                          )}
                          {plan.session_duration_minutes && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Duration:</span>
                              <span className="font-semibold text-purple-400">{plan.session_duration_minutes} min</span>
                            </div>
                          )}
                          {plan.discount_percent > 0 && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Discount:</span>
                              <span className="font-semibold text-green-400">{plan.discount_percent}%</span>
                            </div>
                          )}
                        </div>
                      )}

                      <ul className="space-y-2.5 mb-6">
                        {(plan.features || []).map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={10} className="text-purple-400" strokeWidth={3} />
                            </div>
                            <span className={`text-sm ${theme.text.secondary}`}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mb-4">
                        <CouponCodeInput
                          serviceType="mentorship"
                          orderAmount={plan.price}
                          currency={currency}
                          onCouponApplied={(result) => {
                            setAppliedCoupon(result);
                            setCouponPlanId(plan.plan_id);
                          }}
                          onCouponRemoved={() => {
                            setAppliedCoupon(null);
                            setCouponPlanId(null);
                          }}
                        />
                      </div>

                      <Button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                        }`}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <>{plan.config.cta} — {currencySymbol}{Math.floor(plan.price / 100)}</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className={`text-center text-sm ${theme.text.muted} mt-6`}>
            One-time payment · Book sessions at your convenience · Expert MAANG mentors
          </p>
        </div>
        )} {/* end activeTab === 'mentorship' */}

        {/* Resume Review Cards */}
        {activeTab === 'resume' && (
        <div className="max-w-4xl mx-auto">
          {resumeReviewPlans.length === 0 ? (
            <div className={`text-center py-12 ${theme.text.muted}`}>
              <p className="text-lg mb-2">Resume review plans coming soon</p>
              <p className="text-sm">Check back shortly or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resumeReviewPlans.map((plan) => {
                const isProcessing = processingPlan === plan.plan_id;
                
                return (
                  <div key={plan.plan_id} className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${theme.bg.card} border-green-500/50 hover:border-green-500`}>
                    <div className="p-7">
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>{plan.name}</h3>
                      
                      <p className={`text-sm ${theme.text.secondary} mb-6`}>{plan.description}</p>
                      
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className={`text-lg ${theme.text.secondary}`}>{currencySymbol}</span>
                        <span className={`text-4xl font-bold ${theme.text.primary}`}>
                          {Math.floor(plan.price / 100).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-sm ${theme.text.muted} ml-1`}>one-time</span>
                      </div>

                      {/* Resume Review Details */}
                      {(plan.review_type || plan.delivery_timeframe) && (
                        <div className={`space-y-2 mb-6 p-3 rounded-lg ${theme.bg.secondary}`}>
                          {plan.review_type && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Type:</span>
                              <span className="font-semibold text-green-400 capitalize">{plan.review_type}</span>
                            </div>
                          )}
                          {plan.delivery_timeframe && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Delivery:</span>
                              <span className="font-semibold text-green-400">{plan.delivery_timeframe}</span>
                            </div>
                          )}
                          {plan.review_type === 'call' && plan.session_duration_minutes && (
                            <div className={`flex justify-between text-sm ${theme.text.secondary}`}>
                              <span>Call Duration:</span>
                              <span className="font-semibold text-green-400">{plan.session_duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      )}

                      <ul className="space-y-2.5 mb-6">
                        {(plan.features || []).map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={10} className="text-green-400" strokeWidth={3} />
                            </div>
                            <span className={`text-sm ${theme.text.secondary}`}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mb-4">
                        <CouponCodeInput
                          serviceType="resume_review"
                          orderAmount={plan.price}
                          currency={currency}
                          onCouponApplied={(result) => {
                            setAppliedCoupon(result);
                            setCouponPlanId(plan.plan_id);
                          }}
                          onCouponRemoved={() => {
                            setAppliedCoupon(null);
                            setCouponPlanId(null);
                          }}
                        />
                      </div>

                      <Button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30`}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <>Get Review — {currencySymbol}{Math.floor(plan.price / 100)}</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className={`text-center text-sm ${theme.text.muted} mt-6`}>
            One-time payment · Expert feedback · Improve your resume instantly
          </p>
        </div>
        )} {/* end activeTab === 'resume' */}

        {/* Feature Comparison Matrix */}
        {activeTab === 'mock' && (
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-2xl font-bold ${theme.text.primary} text-center mb-6`}>
            Compare Plans
          </h2>
          <div className={`overflow-x-auto rounded-xl border ${theme.border.primary}`}>
            <table className="w-full">
              <thead>
                <tr className={`${theme.bg.secondary} border-b ${theme.border.primary}`}>
                  <th className={`text-left py-4 px-5 text-sm font-semibold ${theme.text.secondary}`}>Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-blue-400">Starter</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#06b6d4]">Pro</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-amber-400">Elite</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b ${theme.border.primary} last:border-b-0 ${
                      index % 2 === 0 ? theme.bg.card : theme.bg.secondary
                    }`}
                  >
                    <td className={`py-3.5 px-5 text-sm ${theme.text.secondary}`}>{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">{renderCellValue(row.starter)}</td>
                    <td className="py-3.5 px-4 text-center">{renderCellValue(row.pro)}</td>
                    <td className="py-3.5 px-4 text-center">{renderCellValue(row.elite)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )} {/* end activeTab === 'mock' feature matrix */}

        {/* Trust Indicators */}
        <div className={`${theme.glass} rounded-xl p-8 ${theme.border.primary} border max-w-4xl mx-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Secure Payment</p>
              <p className={`${theme.text.muted} text-sm`}>Powered by {currency === 'USD' ? 'Cashfree' : 'Razorpay'}</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Expert Mentors</p>
              <p className={`${theme.text.muted} text-sm`}>From MAANG companies</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Join 1000+ Users</p>
              <p className={`${theme.text.muted} text-sm`}>Preparing for interviews</p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center max-w-2xl mx-auto">
          <p className={`text-sm ${theme.text.muted} mb-2`}>
            One-time payment • No subscriptions • No hidden fees
          </p>
          <p className={`text-xs ${theme.text.muted}`}>
            Have questions? Contact us at{' '}
            <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">
              support@codementee.com
            </a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenteePricing;
