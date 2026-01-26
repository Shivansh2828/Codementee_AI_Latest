import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { cohortData, pricingPlans } from '../data/mock';
import { toast } from 'sonner';

const ApplyPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentRole: '',
    targetRole: '',
    timeline: '',
    struggle: '',
    selectedPlan: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store in localStorage for demo
    const applications = JSON.parse(localStorage.getItem('codementee_applications') || '[]');
    applications.push({ ...formData, submittedAt: new Date().toISOString() });
    localStorage.setItem('codementee_applications', JSON.stringify(applications));

    toast.success('Application submitted successfully!');
    setIsSubmitting(false);
    navigate('/confirmation');
  };

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
            <div className="mb-10">
              <span className="caption mb-4 block">Apply Now</span>
              <h1 className="heading-1 mb-4">
                Join the Founding Cohort
              </h1>
              <p className="body-large">
                Tell us about yourself. If shortlisted, you'll receive payment & onboarding details within 24 hours.
              </p>
              
              {/* Seat Counter */}
              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10">
                <span className="w-2 h-2 bg-[#06b6d4] rounded-full seat-pulse" />
                <span className="text-sm text-slate-200">
                  <span className="text-[#06b6d4] font-semibold">{cohortData.seatsRemaining}</span> founding seats remaining
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Full Name <span className="text-[#06b6d4]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address <span className="text-[#06b6d4]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Current Role */}
              <div>
                <label htmlFor="currentRole" className="block text-white font-medium mb-2">
                  Current Role & Experience <span className="text-[#06b6d4]">*</span>
                </label>
                <input
                  type="text"
                  id="currentRole"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] transition-colors"
                  placeholder="e.g., SDE-1, 3 years experience"
                />
              </div>

              {/* Target Role */}
              <div>
                <label htmlFor="targetRole" className="block text-white font-medium mb-2">
                  Target Role & Companies <span className="text-[#06b6d4]">*</span>
                </label>
                <input
                  type="text"
                  id="targetRole"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] transition-colors"
                  placeholder="e.g., SDE-2 at Google, Amazon, Flipkart"
                />
              </div>

              {/* Timeline */}
              <div>
                <label htmlFor="timeline" className="block text-white font-medium mb-2">
                  Interview Timeline <span className="text-[#06b6d4]">*</span>
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white focus:outline-none focus:border-[#06b6d4] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your timeline</option>
                  <option value="within_30">Within 30 days</option>
                  <option value="30_60">30-60 days</option>
                  <option value="60_90">60-90 days</option>
                  <option value="exploring">Just exploring</option>
                </select>
              </div>

              {/* Biggest Struggle */}
              <div>
                <label htmlFor="struggle" className="block text-white font-medium mb-2">
                  What's your biggest interview struggle? <span className="text-[#06b6d4]">*</span>
                </label>
                <textarea
                  id="struggle"
                  name="struggle"
                  value={formData.struggle}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] transition-colors resize-none"
                  placeholder="Be specific. This helps us understand how to help you."
                />
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Which plan interests you? <span className="text-[#06b6d4]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {pricingPlans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedPlan === plan.id
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-[#334155] bg-[#1e293b] hover:border-[#475569]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedPlan"
                          value={plan.id}
                          checked={formData.selectedPlan === plan.id}
                          onChange={handleInputChange}
                          required
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.selectedPlan === plan.id
                            ? 'border-[#06b6d4] bg-[#06b6d4]'
                            : 'border-slate-500'
                        }`}>
                          {formData.selectedPlan === plan.id && (
                            <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                          )}
                        </div>
                        <div>
                          <span className="text-white font-medium">{plan.name}</span>
                          {plan.popular && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#06b6d4] text-[#0f172a] font-semibold">
                              Best Value
                            </span>
                          )}
                          <p className="text-slate-400 text-sm">{plan.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{cohortData.currency}{plan.price.toLocaleString()}</span>
                        {plan.savings && (
                          <p className="text-[#06b6d4] text-xs">{plan.savings}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-400">
                We review applications within 24 hours. Payment link sent after approval.
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
