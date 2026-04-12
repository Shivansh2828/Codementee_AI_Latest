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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Founding Slots Badge */}
          {!sold_out && remaining <= 10 && (
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse-glow">
              <span className="text-lg">🚀</span>
              <span className="text-sm font-bold">
                Only {remaining} of {total} Founding Seats Left
              </span>
            </div>
          )}
          
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

        {/* Pricing Cards - Modern Design */}
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

        {/* Feature Comparison Matrix */}
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
