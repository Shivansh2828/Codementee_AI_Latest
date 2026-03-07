import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFoundingSlots } from '../../hooks/useFoundingSlots';
import UrgencyNotification from '../../components/UrgencyNotification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Check, 
  Crown, 
  Sparkles,
  Calendar,
  FileText,
  Target,
  Users,
  MessageSquare,
  Award,
  Loader2,
  ArrowRight,
  Shield
} from "lucide-react";
import api from "../../utils/api";

const MenteePricing = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { remaining, total, sold_out } = useFoundingSlots(30000);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [plans, setPlans] = useState([]);

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  const currentPlanId = user?.plan_id;
  const quotaExhausted = user?.interview_quota_remaining === 0 && user?.plan_id;
  const isEliteUser = user?.plan_id === 'elite';

  // Single mock add-on details
  const mockAddons = [
    {
      plan_id: 'mock_1',
      name: '1 Mock Interview',
      price: 249900, // ₹2,499
      mocks: 1,
      description: 'Add one more mock interview'
    },
    {
      plan_id: 'mock_3',
      name: '3 Mock Interviews',
      price: 699900, // ₹6,999
      mocks: 3,
      description: 'Best value - Save 7%',
      discount: '7% OFF'
    },
    {
      plan_id: 'mock_5',
      name: '5 Mock Interviews',
      price: 1099900, // ₹10,999
      mocks: 5,
      description: 'Maximum savings - Save 12%',
      discount: '12% OFF',
      popular: true
    }
  ];

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await api.get('/pricing-plans');
      setPlans(response.data);
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
        is_upgrade: !isFreeUser
      });

      const { order_id, razorpay_order_id, amount, razorpay_key_id } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: 'INR',
        name: 'Codementee',
        description: `${plan.name} Plan`,
        order_id: razorpay_order_id,  // Use Razorpay's order ID, not our internal ID
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify', {
              order_id: order_id,  // Use our internal order ID for verification
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your account has been upgraded.');
              
              // Update local user data
              localStorage.setItem('token', verifyResponse.data.access_token);
              
              // Reload page to reflect changes
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
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  };

  const getPlanFeatures = (planId) => {
    const featureMap = {
      'starter': [
        { text: '1 Mock Interview', icon: Calendar, highlight: true },
        { text: '1 Email Resume Review (on request)', icon: FileText },
        { text: 'Limited AI Tools Access', icon: Sparkles },
        { text: 'Basic Support', icon: MessageSquare }
      ],
      'pro': [
        { text: '3 Mock Interviews', icon: Calendar, highlight: true },
        { text: '1 Resume Review Call with MAANG Engineer', icon: FileText },
        { text: 'Full AI Tools Access', icon: Sparkles },
        { text: '1 Strategy Call', icon: MessageSquare },
        { text: 'Community Access', icon: Users },
        { text: 'Priority Support', icon: Shield }
      ],
      'elite': [
        { text: '6 Mock Interviews', icon: Calendar, highlight: true },
        { text: '1 Live Resume Review Call Session', icon: FileText },
        { text: '1 Offline Profile Creation', icon: Target, highlight: true },
        { text: 'Full AI Tools Access', icon: Sparkles },
        { text: 'Referral Guidance (Best Effort)', icon: Award },
        { text: 'WhatsApp Priority Support', icon: Shield },
        { text: 'Community Access', icon: Users }
      ]
    };

    return featureMap[planId] || [];
  };

  const getPlanBadge = (planId) => {
    if (planId === 'pro') return { text: 'Most Popular', color: 'bg-blue-500' };
    if (planId === 'elite') return { text: 'Best Value', color: 'bg-purple-500' };
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout title="Pricing Plans">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading pricing plans...</p>
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
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.accent} border text-center`}>
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-[#06b6d4]" />
              <p className={theme.text.primary}>
                You're currently on the <span className="font-bold">{user?.plan_name || 'Active'}</span> plan
              </p>
            </div>
          </div>
        )}

        {/* Mock Add-on Packs - Show for all paid users */}
        {!isFreeUser && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${theme.text.primary} mb-3`}>
                Need More Mock Interviews?
              </h2>
              <p className={`${theme.text.secondary} text-lg`}>
                Add individual mock interviews or packs to your current plan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {mockAddons.map((addon) => (
                <div
                  key={addon.plan_id}
                  className={`${theme.glass} rounded-xl ${theme.border.primary} border ${
                    addon.popular ? 'ring-2 ring-green-500 scale-105' : ''
                  } ${theme.shadow} p-6 transition-all hover:scale-105 relative`}
                >
                  {addon.discount && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white">
                        {addon.discount}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className={`${theme.text.primary} text-xl font-bold mb-1`}>
                      {addon.name}
                    </h3>
                    <p className={`${theme.text.muted} text-sm`}>
                      {addon.description}
                    </p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className={`${theme.text.primary} text-3xl font-bold`}>
                      ₹{Math.floor(addon.price / 100).toLocaleString('en-IN')}
                    </p>
                    <p className={`${theme.text.muted} text-sm mt-1`}>
                      ₹{Math.floor(addon.price / addon.mocks / 100).toLocaleString('en-IN')} per mock
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleUpgrade(addon)}
                    disabled={processingPlan === addon.plan_id}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    {processingPlan === addon.plan_id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Buy Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider for paid users */}
        {!isFreeUser && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme.border.primary}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${theme.bg.primary} ${theme.text.muted}`}>
                  Or upgrade your plan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans
            .filter(plan => {
              // Show all plans for free users
              if (isFreeUser) return true;
              
              // For paid users, only show upgrade paths
              const planHierarchy = { 'starter': 1, 'pro': 2, 'elite': 3 };
              const currentLevel = planHierarchy[currentPlanId] || 0;
              const planLevel = planHierarchy[plan.plan_id] || 0;
              
              // Show current plan and higher tiers
              return planLevel >= currentLevel;
            })
            .map((plan) => {
            const features = getPlanFeatures(plan.plan_id);
            const badge = getPlanBadge(plan.plan_id);
            const isCurrentPlan = currentPlanId === plan.plan_id;
            const isProcessing = processingPlan === plan.plan_id;
            const isPopular = plan.plan_id === 'pro';

            return (
              <div
                key={plan.plan_id}
                className={`${theme.glass} rounded-2xl ${theme.border.primary} border ${
                  isPopular ? 'ring-2 ring-[#06b6d4] scale-105' : ''
                } ${theme.shadow} transition-all hover:scale-105 relative`}
              >
                {/* Badge */}
                {badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className={`${badge.color} text-white px-4 py-1`}>
                      {badge.text}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 rounded-2xl ${
                    plan.plan_id === 'starter' ? 'bg-green-400/20' :
                    plan.plan_id === 'pro' ? 'bg-blue-400/20' :
                    'bg-purple-400/20'
                  } flex items-center justify-center mx-auto mb-4`}>
                    <Crown className={`w-8 h-8 ${
                      plan.plan_id === 'starter' ? 'text-green-400' :
                      plan.plan_id === 'pro' ? 'text-blue-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <CardTitle className={`text-2xl ${theme.text.primary}`}>
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className={`text-5xl font-bold ${theme.text.primary}`}>
                      ₹{Math.floor(plan.price / 100).toLocaleString('en-IN')}
                    </span>
                    {plan.duration_months > 1 && (
                      <p className={`${theme.text.muted} text-sm mt-2`}>
                        ₹{Math.floor(plan.price / 100 / plan.duration_months).toLocaleString('en-IN')}/month
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full ${
                            feature.highlight ? 'bg-[#06b6d4]/20' : 'bg-green-400/20'
                          } flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            {feature.highlight ? (
                              <Icon className="w-3 h-3 text-[#06b6d4]" />
                            ) : (
                              <Check className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                          <span className={`${theme.text.secondary} text-sm`}>
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || isProcessing}
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-gray-600 cursor-not-allowed'
                        : isPopular
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4]'
                        : 'bg-[#171717] hover:bg-[#334155]'
                    } text-white`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {isFreeUser ? 'Get Started' : 'Upgrade'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className={`${theme.glass} rounded-xl p-8 ${theme.border.primary} border text-center max-w-4xl mx-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Shield className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Secure Payment</p>
              <p className={`${theme.text.muted} text-sm`}>Powered by Razorpay</p>
            </div>
            <div>
              <Award className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Expert Mentors</p>
              <p className={`${theme.text.muted} text-sm`}>From MAANG companies</p>
            </div>
            <div>
              <Users className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className={`${theme.text.primary} font-semibold mb-1`}>Join 1000+ Users</p>
              <p className={`${theme.text.muted} text-sm`}>Preparing for interviews</p>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center max-w-2xl mx-auto">
          <p className={`${theme.text.secondary} text-sm`}>
            Have questions? Contact us at{' '}
            <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">
              support@codementee.com
            </a>
          </p>
        </div>
      </div>
      
      {/* Urgency Notification */}
      <UrgencyNotification />
    </DashboardLayout>
  );
};

export default MenteePricing;
