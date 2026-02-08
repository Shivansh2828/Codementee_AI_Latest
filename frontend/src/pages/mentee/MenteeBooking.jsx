import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { Building2, Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft, Brain, Users, Code, MessageSquare, CreditCard, Loader2, Star, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const MenteeBooking = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [slots, setSlots] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [interviewType, setInterviewType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interviewTrack, setInterviewTrack] = useState('general');
  const [specificTopics, setSpecificTopics] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;

  // Auto-advance to next step with smooth transition
  const autoAdvanceToStep = (nextStep, delay = 800) => {
    setTimeout(() => {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, delay);
  };

  // Auto-advance when both interview type and experience are selected
  useEffect(() => {
    if (step === 2 && interviewType && experienceLevel) {
      toast.success('Interview details set! Moving to time slots...');
      autoAdvanceToStep(3, 1200);
    }
  }, [interviewType, experienceLevel, step]);

  // Auto-advance when slots are selected (Step 3)
  useEffect(() => {
    if (step === 3 && selectedSlots.length > 0) {
      toast.success(`${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected! Moving to review...`);
      autoAdvanceToStep(4, 1500);
    }
  }, [selectedSlots.length, step]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const interviewTypes = [
    {
      id: 'coding',
      name: 'Coding Interview',
      description: 'Data structures, algorithms, coding problems',
      icon: Code,
      color: 'text-blue-400',
      duration: '60-90 minutes'
    },
    {
      id: 'system_design',
      name: 'System Design',
      description: 'Architecture, scalability, distributed systems',
      icon: Brain,
      color: 'text-purple-400',
      duration: '45-60 minutes'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Interview',
      description: 'Leadership, teamwork, problem-solving scenarios',
      icon: MessageSquare,
      color: 'text-green-400',
      duration: '30-45 minutes'
    },
    {
      id: 'hr_round',
      name: 'HR Round',
      description: 'Culture fit, salary negotiation, company questions',
      icon: Users,
      color: 'text-orange-400',
      duration: '30-45 minutes'
    }
  ];

  const experienceLevels = [
    { id: 'junior', name: 'Junior (0-2 years)', description: 'Entry level, fresh graduate' },
    { id: 'mid', name: 'Mid-level (2-5 years)', description: 'Some industry experience' },
    { id: 'senior', name: 'Senior (5+ years)', description: 'Experienced professional' },
    { id: 'staff_plus', name: 'Staff+ (8+ years)', description: 'Senior leadership, architect level' }
  ];

  const topicOptions = {
    coding: ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Recursion & Backtracking', 'Sorting & Searching'],
    system_design: ['Scalability', 'Database Design', 'Caching', 'Load Balancing', 'Microservices', 'Message Queues', 'CDN & Storage'],
    behavioral: ['Leadership', 'Conflict Resolution', 'Project Management', 'Team Collaboration', 'Problem Solving', 'Decision Making'],
    hr_round: ['Company Culture', 'Career Goals', 'Salary Negotiation', 'Work-Life Balance', 'Team Fit', 'Growth Mindset']
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, slotsRes, pricingRes] = await Promise.all([
          api.get('/companies'),
          api.get('/available-slots'),
          api.get('/pricing-plans')
        ]);
        setCompanies(companiesRes.data);
        setSlots(slotsRes.data);
        setPricingPlans(pricingRes.data);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        toast.error('Failed to load data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSlotToggle = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else if (selectedSlots.length < 2) {
      setSelectedSlots([...selectedSlots, slotId]);
    } else {
      toast.error('You can only select up to 2 slots');
    }
  };

  const handleTopicToggle = (topic) => {
    if (specificTopics.includes(topic)) {
      setSpecificTopics(specificTopics.filter(t => t !== topic));
    } else {
      setSpecificTopics([...specificTopics, topic]);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setPaymentLoading(true);
    
    try {
      // Create payment order
      const orderResponse = await api.post('/payment/create-order', {
        name: user.name,
        email: user.email,
        password: 'temp-password', // Will be updated
        plan_id: selectedPlan,
        current_role: user.current_role || '',
        target_role: user.target_role || ''
      });

      const { order_id, razorpay_order_id, amount, currency } = orderResponse.data;
      const selectedPlanDetails = pricingPlans.find(p => p.id === selectedPlan);

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_S8Pnnj923wxaob',
        amount: amount,
        currency: currency,
        name: 'Codementee',
        description: selectedPlanDetails?.name || 'Membership',
        order_id: razorpay_order_id,
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#06b6d4'
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify', {
              order_id: order_id, // Add the missing order_id
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful! You can now book mock interviews.');
              
              // Update user context or reload page
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } catch (err) {
            toast.error(err.response?.data?.detail || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany || selectedSlots.length === 0 || !interviewType || !experienceLevel) {
      toast.error('Please complete all required fields');
      return;
    }
    
    // If user is free, redirect to payment first
    if (isFreeUser) {
      setStep(5); // Payment step
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/mentee/booking-request', {
        company_id: selectedCompany.id,
        slot_ids: selectedSlots,
        interview_type: interviewType,
        experience_level: experienceLevel,
        interview_track: interviewTrack,
        specific_topics: specificTopics,
        additional_notes: additionalNotes
      });
      toast.success('Booking request submitted! Your mentor will confirm soon.');
      // Reset form
      setStep(1);
      setSelectedCompany(null);
      setSelectedSlots([]);
      setInterviewType('');
      setExperienceLevel('');
      setInterviewTrack('general');
      setSpecificTopics([]);
      setAdditionalNotes('');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to submit booking request');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Group slots by date and filter by interview type compatibility
  const groupedSlots = slots
    .filter(slot => {
      // If slot has interview_types defined, check compatibility
      if (slot.interview_types && slot.interview_types.length > 0) {
        return slot.interview_types.includes(interviewType);
      }
      // If no interview_types defined, slot supports all types
      return true;
    })
    .reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});

  if (loading) {
    return (
      <DashboardLayout title="Schedule Mock Interview">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading booking options...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Schedule Mock Interview">
      {/* Enhanced Progress Steps */}
      <div className={`${theme.glass} rounded-2xl p-6 mb-8 ${theme.border.primary} border`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Booking Progress</h3>
          <span className={`text-sm ${theme.text.secondary}`}>Step {step} of {isFreeUser ? 5 : 4}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          <div className={`flex items-center gap-2 ${step >= 1 ? theme.text.accent : theme.text.muted}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
              step >= 1 
                ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg' 
                : `${theme.bg.secondary} ${theme.text.muted}`
            }`}>
              {step > 1 ? <CheckCircle size={20} /> : '1'}
            </div>
            <span className="hidden sm:inline font-medium text-sm">Company</span>
          </div>
          <div className={`w-12 h-0.5 transition-all ${step >= 2 ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]' : theme.border.primary}`} />
          
          <div className={`flex items-center gap-2 ${step >= 2 ? theme.text.accent : theme.text.muted}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
              step >= 2 
                ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg' 
                : `${theme.bg.secondary} ${theme.text.muted}`
            }`}>
              {step > 2 ? <CheckCircle size={20} /> : '2'}
            </div>
            <span className="hidden sm:inline font-medium text-sm">Interview</span>
          </div>
          <div className={`w-12 h-0.5 transition-all ${step >= 3 ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]' : theme.border.primary}`} />
          
          <div className={`flex items-center gap-2 ${step >= 3 ? theme.text.accent : theme.text.muted}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
              step >= 3 
                ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg' 
                : `${theme.bg.secondary} ${theme.text.muted}`
            }`}>
              {step > 3 ? <CheckCircle size={20} /> : '3'}
            </div>
            <span className="hidden sm:inline font-medium text-sm">Schedule</span>
          </div>
          <div className={`w-12 h-0.5 transition-all ${step >= 4 ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]' : theme.border.primary}`} />
          
          <div className={`flex items-center gap-2 ${step >= 4 ? theme.text.accent : theme.text.muted}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
              step >= 4 
                ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg' 
                : `${theme.bg.secondary} ${theme.text.muted}`
            }`}>
              {step > 4 ? <CheckCircle size={20} /> : '4'}
            </div>
            <span className="hidden sm:inline font-medium text-sm">Review</span>
          </div>
          
          {isFreeUser && (
            <>
              <div className={`w-12 h-0.5 transition-all ${step >= 5 ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]' : theme.border.primary}`} />
              <div className={`flex items-center gap-2 ${step >= 5 ? theme.text.accent : theme.text.muted}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  step >= 5 
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg' 
                    : `${theme.bg.secondary} ${theme.text.muted}`
                }`}>
                  <CreditCard size={20} />
                </div>
                <span className="hidden sm:inline font-medium text-sm">Payment</span>
              </div>
            </>
          )}
        </div>
        
        {/* Step Description */}
        <div className={`mt-4 p-3 ${theme.bg.secondary} rounded-lg`}>
          <p className={`text-sm ${theme.text.secondary} text-center`}>
            {step === 1 && "Choose the company you're preparing for"}
            {step === 2 && "Select interview type and your experience level"}
            {step === 3 && "Pick your preferred time slots"}
            {step === 4 && "Review and confirm your booking details"}
            {step === 5 && "Choose your plan and complete payment"}
          </p>
        </div>
      </div>

      {/* Step 1: Select Company */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h2 className={`heading-2 ${theme.text.primary} mb-2`}>Which company are you preparing for?</h2>
            <p className={`body-large ${theme.text.secondary} mb-4`}>Select the company you want to practice your mock interview for. Our mentors are engineers from these companies.</p>
            
            {/* Info Card */}
            <div className={`${theme.glass} rounded-xl p-4 mb-6 ${theme.border.primary} border`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 ${theme.text.accent} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`ui-medium ${theme.text.primary} font-medium mb-1`}>Why choose a specific company?</p>
                  <p className={`body-small ${theme.text.secondary}`}>
                    Each company has unique interview styles, question patterns, and evaluation criteria. 
                    Our mentors will tailor the mock interview to match your target company's process.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {companies.length === 0 ? (
            <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border p-8 text-center`}>
              <Building2 size={48} className={`mx-auto ${theme.text.muted} mb-4`} />
              <p className={theme.text.secondary}>No companies available yet</p>
              <p className={`${theme.text.muted} text-sm`}>Please contact support or wait for admin to add companies</p>
            </div>
          ) : (
            <>
              {/* Group companies by category */}
              {['product', 'unicorn', 'startup'].map(category => {
                const categoryCompanies = companies.filter(c => c.category === category);
                if (categoryCompanies.length === 0) return null;
                
                const categoryLabels = {
                  product: 'Product Companies',
                  unicorn: 'Indian Unicorns',
                  startup: 'Startups'
                };
                
                const categoryColors = {
                  product: 'bg-blue-400',
                  unicorn: 'bg-purple-400',
                  startup: 'bg-green-400'
                };
                
                return (
                  <div key={category} className="mb-8">
                    <h3 className={`heading-4 ${theme.text.primary} mb-4 flex items-center gap-2`}>
                      <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                      {categoryLabels[category]}
                      <span className={`body-small ${theme.text.muted} font-normal`}>({categoryCompanies.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryCompanies.map((company) => (
                        <button
                          key={company.id}
                          onClick={() => {
                            setSelectedCompany(company);
                            toast.success(`${company.name} selected! Moving to interview details...`);
                            autoAdvanceToStep(2);
                          }}
                          className={`p-5 rounded-xl border text-left transition-all transform hover:-translate-y-1 ${
                            selectedCompany?.id === company.id
                              ? `${theme.bg.card} border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20`
                              : `${theme.bg.card} ${theme.border.primary} ${theme.bg.hover}`
                          }`}
                          data-testid={`company-select-${company.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${theme.bg.secondary} rounded-lg flex items-center justify-center`}>
                              {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                              ) : (
                                <Building2 size={24} className="text-[#06b6d4]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className={`${theme.text.primary} ui-medium`}>{company.name}</h3>
                                {selectedCompany?.id === company.id && (
                                  <CheckCircle size={20} className="text-[#06b6d4]" />
                                )}
                              </div>
                              {company.description && (
                                <p className={`${theme.text.secondary} text-sm mb-2`}>{company.description}</p>
                              )}
                              {company.interview_tracks && company.interview_tracks.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {company.interview_tracks.slice(0, 3).map((track) => (
                                    <span key={track} className={`px-2 py-1 ${theme.bg.secondary} ${theme.text.muted} text-xs rounded`}>
                                      {track.toUpperCase()}
                                    </span>
                                  ))}
                                  {company.interview_tracks.length > 3 && (
                                    <span className={`px-2 py-1 ${theme.bg.secondary} ${theme.text.muted} text-xs rounded`}>
                                      +{company.interview_tracks.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          {selectedCompany && (
            <div className={`${theme.glass} rounded-xl p-4 mt-6 ${theme.border.primary} border`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-[#06b6d4] w-5 h-5" />
                <p className={`${theme.text.primary} font-medium`}>
                  {selectedCompany.name} selected! Moving to interview details...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Interview Type & Experience */}
      {step === 2 && (
        <div>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>What type of interview do you want to practice?</h2>
          <p className={`${theme.text.secondary} mb-6`}>Choose the interview type and your experience level</p>
          
          {/* Interview Type Selection */}
          <div className="mb-8">
            <h3 className={`text-lg font-medium ${theme.text.primary} mb-4`}>Interview Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setInterviewType(type.id);
                      toast.success(`${type.name} selected!`);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      interviewType === type.id
                        ? `${theme.bg.card} border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20`
                        : `${theme.bg.card} ${theme.border.primary} ${theme.bg.hover}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent size={24} className={type.color} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`${theme.text.primary} font-medium`}>{type.name}</h4>
                          <span className={`text-xs ${theme.text.muted}`}>{type.duration}</span>
                        </div>
                        <p className={`${theme.text.secondary} text-sm`}>{type.description}</p>
                      </div>
                      {interviewType === type.id && (
                        <CheckCircle size={20} className="text-[#06b6d4]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-8">
            <h3 className={`text-lg font-medium ${theme.text.primary} mb-4`}>Experience Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => {
                    setExperienceLevel(level.id);
                    toast.success(`${level.name} selected!`);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    experienceLevel === level.id
                      ? `${theme.bg.card} border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20`
                      : `${theme.bg.card} ${theme.border.primary} ${theme.bg.hover}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`${theme.text.primary} font-medium mb-1`}>{level.name}</h4>
                      <p className={`${theme.text.secondary} text-sm`}>{level.description}</p>
                    </div>
                    {experienceLevel === level.id && (
                      <CheckCircle size={20} className="text-[#06b6d4]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Track Selection */}
          {selectedCompany && selectedCompany.interview_tracks && selectedCompany.interview_tracks.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>Interview Track</h3>
              <p className={`${theme.text.secondary} text-sm mb-4`}>Choose the specific role level you're targeting at {selectedCompany.name}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setInterviewTrack('general')}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    interviewTrack === 'general'
                      ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                      : `${theme.bg.card} ${theme.border.primary} ${theme.text.secondary} hover:border-[#06b6d4]/50`
                  }`}
                >
                  <span className="font-medium text-sm">General</span>
                </button>
                {selectedCompany.interview_tracks.map((track) => (
                  <button
                    key={track}
                    onClick={() => setInterviewTrack(track)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      interviewTrack === track
                        ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                        : `${theme.bg.card} ${theme.border.primary} ${theme.text.secondary} hover:border-[#06b6d4]/50`
                    }`}
                  >
                    <span className="font-medium text-sm">{track.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specific Topics (Optional) */}
          {interviewType && (
            <div className="mb-8">
              <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>Focus Areas (Optional)</h3>
              <p className={`${theme.text.secondary} text-sm mb-4`}>Select specific topics you'd like to focus on</p>
              <div className="flex flex-wrap gap-2">
                {topicOptions[interviewType]?.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      specificTopics.includes(topic)
                        ? 'bg-[#06b6d4] text-white'
                        : `${theme.bg.card} ${theme.text.secondary} ${theme.border.primary} border hover:border-[#06b6d4]/50`
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>Additional Notes (Optional)</h3>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any specific requirements or areas you'd like your mentor to focus on..."
              className={`w-full p-3 ${theme.input.base} rounded-lg resize-none focus:outline-none`}
              rows={3}
            />
          </div>

          {/* Progress Indicator for Step 2 */}
          {interviewType && experienceLevel && (
            <div className={`${theme.glass} rounded-xl p-4 mt-6 ${theme.border.primary} border`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-[#06b6d4] w-5 h-5" />
                <p className={`${theme.text.primary} font-medium`}>
                  Interview details complete! Moving to time slots...
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
            >
              <ArrowLeft size={18} /> Back
            </button>
            {!interviewType || !experienceLevel ? (
              <div className={`${theme.text.muted} text-sm`}>
                Select interview type and experience level to continue
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Step 3: Choose Slots */}
      {step === 3 && (
        <div>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>Select your preferred time slots</h2>
          <p className={`${theme.text.secondary} mb-6`}>Choose up to 2 slots that work for you. Your mentor will confirm one.</p>
          
          {Object.keys(groupedSlots).length === 0 ? (
            <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border p-8 text-center`}>
              <Calendar size={48} className={`mx-auto ${theme.text.muted} mb-4`} />
              <p className={`${theme.text.secondary}`}>No available slots for {interviewTypes.find(t => t.id === interviewType)?.name}</p>
              <p className={`${theme.text.muted} text-sm`}>Try selecting a different interview type or check back later</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dateSlots]) => (
                <div key={date} className={`${theme.bg.card} rounded-xl ${theme.border.primary} border overflow-hidden`}>
                  <div className={`${theme.bg.secondary} px-5 py-3 ${theme.border.primary} border-b`}>
                    <span className={`${theme.text.primary} font-medium`}>{formatDate(date)}</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotToggle(slot.id)}
                        className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                          selectedSlots.includes(slot.id)
                            ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                            : `${theme.bg.secondary} ${theme.border.primary} ${theme.text.secondary} hover:border-[#06b6d4]/50`
                        }`}
                        data-testid={`slot-select-${slot.id}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock size={16} />
                          <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                          {selectedSlots.includes(slot.id) && <CheckCircle size={16} />}
                        </div>
                        {slot.interview_types && slot.interview_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {slot.interview_types.slice(0, 2).map((type) => (
                              <span key={type} className={`px-2 py-1 text-xs rounded ${
                                type === interviewType 
                                  ? 'bg-[#06b6d4]/20 text-[#06b6d4]' 
                                  : `${theme.bg.secondary} ${theme.text.muted}`
                              }`}>
                                {type.replace('_', ' ')}
                              </span>
                            ))}
                            {slot.interview_types.length > 2 && (
                              <span className={`px-2 py-1 text-xs rounded ${theme.bg.secondary} ${theme.text.muted}`}>
                                +{slot.interview_types.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress Indicator for Step 3 */}
          {selectedSlots.length > 0 && (
            <div className={`${theme.glass} rounded-xl p-4 mt-6 ${theme.border.primary} border`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-[#06b6d4] w-5 h-5" />
                <p className={`${theme.text.primary} font-medium`}>
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected! Moving to review...
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div className="flex items-center gap-4">
              <span className={`${theme.text.secondary} text-sm`}>{selectedSlots.length}/2 slots selected</span>
              <button
                onClick={() => setStep(4)}
                disabled={selectedSlots.length === 0}
                className="flex items-center gap-2 bg-[#06b6d4] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="next-step-btn"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>Review your booking request</h2>
          <p className={`${theme.text.secondary} mb-6`}>Please confirm the details below. Your mentor will receive a notification.</p>
          
          <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border p-6 mb-6`}>
            <div className="space-y-6">
              {/* Company */}
              <div className={`flex items-center gap-4 pb-4 ${theme.border.primary} border-b`}>
                <div className={`w-12 h-12 ${theme.bg.secondary} rounded-lg flex items-center justify-center`}>
                  <Building2 size={24} className="text-[#06b6d4]" />
                </div>
                <div>
                  <p className={`${theme.text.secondary} text-sm`}>Company</p>
                  <p className={`${theme.text.primary} font-medium text-lg`}>{selectedCompany?.name}</p>
                </div>
              </div>
              
              {/* Interview Details */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 ${theme.border.primary} border-b`}>
                <div>
                  <p className={`${theme.text.secondary} text-sm mb-2`}>Interview Type</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const type = interviewTypes.find(t => t.id === interviewType);
                      const IconComponent = type?.icon;
                      return (
                        <>
                          {IconComponent && <IconComponent size={18} className={type.color} />}
                          <span className={`${theme.text.primary} font-medium`}>{type?.name}</span>
                          <span className={`${theme.text.secondary} text-sm`}>({type?.duration})</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <p className={`${theme.text.secondary} text-sm mb-2`}>Experience Level</p>
                  <p className={`${theme.text.primary} font-medium`}>
                    {experienceLevels.find(l => l.id === experienceLevel)?.name}
                  </p>
                </div>
              </div>

              {/* Interview Track */}
              {interviewTrack && interviewTrack !== 'general' && (
                <div className={`pb-4 ${theme.border.primary} border-b`}>
                  <p className={`${theme.text.secondary} text-sm mb-2`}>Interview Track</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#06b6d4]/20 text-[#06b6d4] text-sm rounded font-medium">
                      {interviewTrack.toUpperCase()}
                    </span>
                    <span className={`${theme.text.secondary} text-sm`}>at {selectedCompany?.name}</span>
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {specificTopics.length > 0 && (
                <div className={`pb-4 ${theme.border.primary} border-b`}>
                  <p className={`${theme.text.secondary} text-sm mb-3`}>Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {specificTopics.map((topic) => (
                      <span key={topic} className="px-2 py-1 bg-[#06b6d4]/20 text-[#06b6d4] text-sm rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {additionalNotes && (
                <div className={`pb-4 ${theme.border.primary} border-b`}>
                  <p className={`${theme.text.secondary} text-sm mb-2`}>Additional Notes</p>
                  <p className={`${theme.text.primary} text-sm`}>{additionalNotes}</p>
                </div>
              )}
              
              {/* Time Slots */}
              <div>
                <p className={`${theme.text.secondary} text-sm mb-3`}>Preferred Time Slots</p>
                <div className="space-y-2">
                  {selectedSlots.map((slotId) => {
                    const slot = slots.find(s => s.id === slotId);
                    return slot ? (
                      <div key={slotId} className={`flex items-center gap-3 p-3 ${theme.bg.secondary} rounded-lg`}>
                        <Calendar size={18} className="text-[#06b6d4]" />
                        <span className={`${theme.text.primary}`}>{formatDate(slot.date)}</span>
                        <Clock size={18} className={`${theme.text.secondary} ml-4`} />
                        <span className={`${theme.text.primary}`}>{slot.start_time} - {slot.end_time}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              <strong>Note:</strong> After submitting, your mentor will review and confirm one of your preferred slots. You'll receive an email notification once confirmed.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#10b981] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
              data-testid="submit-booking-btn"
            >
              {submitting ? 'Submitting...' : isFreeUser ? 'Continue to Payment' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Payment (Free Users Only) */}
      {step === 5 && isFreeUser && (
        <div>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>Choose Your Plan</h2>
          <p className={`${theme.text.secondary} mb-6`}>Select a plan to complete your booking and start mock interviews</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`rounded-xl overflow-hidden transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-2 border-[#06b6d4] bg-[#06b6d4]/5'
                    : plan.popular 
                      ? `border-2 border-[#06b6d4] ${theme.bg.secondary}` 
                      : `${theme.border.primary} border ${theme.bg.card} hover:border-[#06b6d4]/50`
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="bg-[#06b6d4] py-2 px-4 text-center">
                    <span className="text-white font-bold text-sm">Most Popular</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className={`text-lg font-bold ${theme.text.primary} mb-1`}>{plan.name}</h4>
                    <p className={`${theme.text.secondary} text-sm`}>{plan.duration}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`${theme.text.secondary}`}>₹</span>
                      <span className={`text-3xl font-bold ${theme.text.primary}`}>{plan.price.toLocaleString()}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-[#06b6d4] text-sm mt-1">{plan.savings}</p>
                    )}
                    <p className={`${theme.text.secondary} text-sm mt-1`}>₹{plan.perMonth.toLocaleString()}/month</p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-[#06b6d4] shrink-0 mt-0.5" />
                        <span className={`${theme.text.secondary} text-sm`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`${theme.bg.secondary} rounded-lg p-3`}>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`${theme.text.secondary}`}>Mock Interviews</span>
                      <span className="text-[#06b6d4] font-bold">
                        {plan.id === 'foundation' ? '1 total' : 
                         plan.id === 'growth' ? '3 total' : 
                         '6 total'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(4)}
              className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={handlePayment}
              disabled={paymentLoading || !selectedPlan}
              className="flex items-center gap-2 bg-[#10b981] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
            >
              {paymentLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><CreditCard size={18} /> Pay ₹{pricingPlans.find(p => p.id === selectedPlan)?.price.toLocaleString()}</>
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeBooking;
