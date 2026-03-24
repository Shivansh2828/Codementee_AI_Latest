import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, CreditCard, Bot, CheckCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const AGENT_PLANS = {
  agent_trial: { 
    name: 'AI Agent Trial', 
    price_inr: 99, 
    price_usd: 2,
    duration: '1 month', 
    tag: 'Try it out',
    savings_inr: null,
    savings_usd: null
  },
  agent_monthly: { 
    name: 'AI Agent Monthly', 
    price_inr: 199, 
    price_usd: 4,
    duration: '1 month', 
    tag: 'Popular',
    savings_inr: null,
    savings_usd: null
  },
  agent_quarterly: { 
    name: 'AI Agent Quarterly', 
    price_inr: 599, 
    price_usd: 10,
    duration: '3 months', 
    tag: 'Save',
    savings_inr: 98,
    savings_usd: 2
  },
};

const AgentPurchasePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { currency, formatPrice, currencySymbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const selectedPlanId = searchParams.get('plan') || 'agent_monthly';
  const plan = AGENT_PLANS[selectedPlanId] || AGENT_PLANS.agent_monthly;

  // Get price based on currency
  const getPrice = (planData) => {
    return currency === 'USD' ? planData.price_usd : planData.price_inr;
  };

  const getSavings = (planData) => {
    return currency === 'USD' ? planData.savings_usd : planData.savings_inr;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    selectedPlan: selectedPlanId,
  });

  // Pre-fill if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
    }
  }, [isAuthenticated, user]);

  // Update plan when URL param changes
  useEffect(() => {
    const p = searchParams.get('plan');
    if (p && AGENT_PLANS[p]) setFormData(prev => ({ ...prev, selectedPlan: p }));
  }, [searchParams]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const currentPlan = AGENT_PLANS[formData.selectedPlan] || plan;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!razorpayLoaded) { toast.error('Payment system is loading. Please try again.'); return; }
    if (!isAuthenticated && formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    try {
      const orderRes = await api.post('/payment/create-order', {
        name: formData.name,
        email: formData.email,
        password: isAuthenticated ? undefined : formData.password,
        plan_id: formData.selectedPlan,
        current_role: '',
        target_role: '',
        is_upgrade: isAuthenticated,
      });

      const { order_id, razorpay_order_id, razorpay_key_id, amount, currency } = orderRes.data;

      const options = {
        key: razorpay_key_id,
        amount,
        currency,
        name: 'Codementee',
        description: currentPlan.name,
        order_id: razorpay_order_id,
        prefill: { name: formData.name, email: formData.email },
        theme: { color: '#06b6d4' },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id,
            });
            if (verifyRes.data.success) {
              localStorage.setItem('token', verifyRes.data.access_token);
              toast.success('Payment successful! Welcome to AI Agents.');
              setTimeout(() => { window.location.href = '/mentee/job-search'; }, 1000);
            }
          } catch (err) {
            toast.error(err.response?.data?.detail || 'Payment verification failed');
          }
        },
        modal: { ondismiss: () => { setIsLoading(false); toast.error('Payment cancelled'); } },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container">
          <div className="max-w-lg mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-[#06b6d4] transition-colors mb-8">
              <ArrowLeft size={18} /> Back to Home
            </button>

            <div className="mb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-[#06b6d4]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Get AI Agents</h1>
              <p className="text-gray-500">AI-powered job search + referral finder</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Plan Selection */}
              <div className="bg-[#171717] rounded-xl border border-[#404040] p-6">
                <h3 className="text-white font-semibold mb-4">Select Plan</h3>
                <div className="space-y-3">
                  {Object.entries(AGENT_PLANS).map(([id, p]) => {
                    const price = getPrice(p);
                    const savings = getSavings(p);
                    return (
                      <label key={id} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.selectedPlan === id ? 'border-[#06b6d4] bg-[#06b6d4]/10' : 'border-[#404040] bg-[#0d0d0d] hover:border-[#475569]'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="selectedPlan" value={id} checked={formData.selectedPlan === id} onChange={handleInputChange} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.selectedPlan === id ? 'border-[#06b6d4] bg-[#06b6d4]' : 'border-gray-500'}`}>
                            {formData.selectedPlan === id && <div className="w-2 h-2 rounded-full bg-[#0d0d0d]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{p.name}</span>
                              {id === 'agent_monthly' && <span className="text-xs px-2 py-0.5 rounded-full bg-[#06b6d4] text-[#0f172a] font-semibold">Popular</span>}
                              {id === 'agent_quarterly' && savings && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-semibold">Save {currencySymbol}{savings}</span>}
                            </div>
                            <p className="text-gray-500 text-sm">{p.duration}</p>
                          </div>
                        </div>
                        <span className="text-white font-bold text-lg">{formatPrice(price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* What you get */}
              <div className="bg-[#171717] rounded-xl border border-[#404040] p-6">
                <h3 className="text-white font-semibold mb-3">What's included</h3>
                <ul className="space-y-2">
                  {['AI Job Search Agent — daily matches', 'AI Referral Finder — LinkedIn contacts + drafts', 'Resume parsing & skill extraction', 'Job scoring (0-100) against your profile', 'Daily email digest with top matches'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                      <span className="text-gray-400 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Details */}
              {!isAuthenticated && (
                <div className="bg-[#171717] rounded-xl border border-[#404040] p-6">
                  <h3 className="text-white font-semibold mb-4">Create Account</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#404040] text-white placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#404040] text-white placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Password *</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={6} className="w-full px-4 py-3 rounded-lg bg-[#0d0d0d] border border-[#404040] text-white placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]" placeholder="Min 6 characters" />
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div className="bg-[#06b6d4]/10 rounded-xl border border-[#06b6d4]/30 p-4 text-center">
                  <p className="text-gray-400 text-sm">Purchasing as <span className="text-white font-medium">{user?.email}</span></p>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-[#06b6d4]/10 rounded-xl border border-[#06b6d4]/30 p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Order Summary</span>
                  <span className="text-[#06b6d4] text-sm">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">{formatPrice(getPrice(currentPlan))}</span>
                </div>
              </div>

              <button type="submit" disabled={isLoading || !razorpayLoaded} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : <><CreditCard size={20} /> Pay {formatPrice(getPrice(currentPlan))}</>}
              </button>

              <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2"><Shield size={16} /><span>Secure Payment</span></div>
                <span>•</span>
                <span>Powered by {currency === 'USD' ? 'Cashfree' : 'Razorpay'}</span>
              </div>

              <p className="text-center text-xs text-gray-600">
                By proceeding, you agree to our{' '}
                <Link to="/terms-of-service" className="text-[#06b6d4] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/refund-policy" className="text-[#06b6d4] hover:underline">Refund Policy</Link>
              </p>

              <p className="text-center text-gray-500 text-sm">
                Already have an account? <Link to="/login" className="text-[#06b6d4] hover:underline">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentPurchasePage;
