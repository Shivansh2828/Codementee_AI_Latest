import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Shield, CreditCard } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { cohortData, pricingPlans } from '../data/mock';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ApplyPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currentRole: '',
    targetRole: '',
    timeline: '',
    struggle: '',
    selectedPlan: 'quarterly'
  });

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

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderRes = await api.post('/payment/create-order', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        plan_id: formData.selectedPlan,
        current_role: formData.currentRole,
        target_role: formData.targetRole,
        timeline: formData.timeline,
        struggle: formData.struggle
      });

      const { order_id, razorpay_order_id, razorpay_key_id, amount, currency } = orderRes.data;

      // Open Razorpay checkout
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        name: 'Codementee',
        description: pricingPlans.find(p => p.id === formData.selectedPlan)?.name || 'Membership',
        order_id: razorpay_order_id,
        prefill: {
          name: formData.name,
          email: formData.email
        },
        theme: {
          color: '#06b6d4'
        },
        handler: async function(response) {
          try {
            // Verify payment
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order_id
            });

            if (verifyRes.data.success) {
              // Store token and redirect
              localStorage.setItem('token', verifyRes.data.access_token);
              toast.success('Payment successful! Welcome to Codementee.');
              
              // Small delay then redirect to mentee dashboard
              setTimeout(() => {
                window.location.href = '/mentee';
              }, 1000);
            }
          } catch (err) {
            toast.error(err.response?.data?.detail || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
      setIsLoading(false);
    }
  };

  const selectedPlanDetails = pricingPlans.find(p => p.id === formData.selectedPlan);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Join Codementee
              </h1>
              <p className="text-slate-400">
                Complete your registration and payment to get started with mock interviews.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Plan Selection */}
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <h3 className="text-white font-semibold mb-4">Select Your Plan</h3>
                <div className="grid grid-cols-1 gap-3">
                  {pricingPlans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedPlan === plan.id
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-[#334155] bg-[#0f172a] hover:border-[#475569]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedPlan"
                          value={plan.id}
                          checked={formData.selectedPlan === plan.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.selectedPlan === plan.id ? 'border-[#06b6d4] bg-[#06b6d4]' : 'border-slate-500'
                        }`}>
                          {formData.selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-[#0f172a]" />}
                        </div>
                        <div>
                          <span className="text-white font-medium">{plan.name}</span>
                          {plan.popular && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#06b6d4] text-[#0f172a] font-semibold">Best Value</span>}
                          <p className="text-slate-400 text-sm">{plan.features[0]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-lg">{cohortData.currency}{plan.price.toLocaleString()}</span>
                        {plan.savings && <p className="text-[#06b6d4] text-xs">{plan.savings}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <h3 className="text-white font-semibold mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info (Optional) */}
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <h3 className="text-white font-semibold mb-4">Tell Us About You <span className="text-slate-400 font-normal">(Optional)</span></h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Current Role</label>
                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                      placeholder="e.g., SDE-1, 3 years"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Target Companies</label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                      placeholder="e.g., Google, Amazon, Flipkart"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#06b6d4]/10 rounded-xl border border-[#06b6d4]/30 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-semibold">Order Summary</span>
                  <span className="text-[#06b6d4] text-sm">{selectedPlanDetails?.name}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-slate-300">Total</span>
                  <span className="text-white">{cohortData.currency}{selectedPlanDetails?.price.toLocaleString()}</span>
                </div>
                {selectedPlanDetails?.savings && (
                  <p className="text-[#06b6d4] text-sm text-right mt-1">{selectedPlanDetails.savings}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !razorpayLoaded}
                className="btn-primary w-full justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={20} /> Pay {cohortData.currency}{selectedPlanDetails?.price.toLocaleString()}</>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Secure Payment</span>
                </div>
                <span>•</span>
                <span>Powered by Razorpay</span>
              </div>

              {/* Terms */}
              <p className="text-center text-xs text-slate-500">
                By proceeding, you agree to our{' '}
                <Link to="/terms-of-service" className="text-[#06b6d4] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/refund-policy" className="text-[#06b6d4] hover:underline">Refund Policy</Link>
              </p>

              {/* Already have account */}
              <p className="text-center text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#06b6d4] hover:underline">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyPage;
