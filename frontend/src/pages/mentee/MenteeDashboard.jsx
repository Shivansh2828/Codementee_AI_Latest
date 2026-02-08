import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { Calendar, MessageSquare, TrendingUp, CreditCard, ArrowRight, Check, Star, Sparkles, Target, Clock, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MenteeDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({ mocks: 0, feedbacks: 0 });
  const [nextMock, setNextMock] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mocks, feedbacks] = await Promise.all([api.get('/mocks'), api.get('/mentee/feedbacks')]);
        setStats({ mocks: mocks.data.length, feedbacks: feedbacks.data.length });
        const upcoming = mocks.data.filter(m => m.status === 'scheduled').sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
        setNextMock(upcoming);
      } catch (e) { console.error(e); }
    };

    const fetchPricing = async () => {
      try {
        const response = await api.get('/pricing-plans');
        setPricingPlans(response.data);
      } catch (e) { console.error(e); }
    };

    fetchStats();
    fetchPricing();
  }, []);

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;

  return (
    <DashboardLayout title={isFreeUser ? "Welcome to Codementee!" : "Welcome back!"}>
      {/* Free User Upgrade Banner */}
      {isFreeUser && (
        <div className={`${theme.glass} ${theme.border.primary} border rounded-2xl p-6 mb-8 ${theme.shadow}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#06b6d4]" />
                <h3 className={`text-xl font-bold ${theme.text.primary}`}>
                  You're exploring Codementee for free!
                </h3>
              </div>
              <p className={`${theme.text.secondary} mb-2`}>
                Browse features, see how everything works, and upgrade when you're ready to book mock interviews.
              </p>
              <p className="text-[#06b6d4] text-sm font-medium">
                No pressure - take your time to explore!
              </p>
            </div>
            <Link 
              to="/mentee/book" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Start Booking Process
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${theme.glass} rounded-2xl ${theme.border.primary} border p-6 ${theme.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-500 text-sm font-medium">Total Mocks</p>
              <p className={`text-3xl font-bold ${theme.text.primary} mt-1`}>{stats.mocks}</p>
              {isFreeUser && <p className="text-purple-500 text-xs mt-1">Upgrade to book interviews</p>}
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className={`${theme.glass} rounded-2xl ${theme.border.primary} border p-6 ${theme.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-500 text-sm font-medium">Feedbacks Received</p>
              <p className={`text-3xl font-bold ${theme.text.primary} mt-1`}>{stats.feedbacks}</p>
              {isFreeUser && <p className="text-green-500 text-xs mt-1">Available after interviews</p>}
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
              <MessageSquare size={24} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className={`${theme.glass} rounded-2xl ${theme.border.primary} border p-6 ${theme.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#06b6d4] text-sm font-medium">Status</p>
              <p className={`text-xl font-bold mt-1 capitalize ${isFreeUser ? theme.text.muted : theme.text.primary}`}>
                {user?.status || 'Free'}
              </p>
              {isFreeUser && <p className="text-[#06b6d4] text-xs mt-1">Free exploration mode</p>}
            </div>
            <div className="bg-gradient-to-br from-[#06b6d4] to-[#0891b2] p-3 rounded-xl shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans for Free Users */}
      {isFreeUser && pricingPlans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-1`}>Choose Your Plan</h3>
              <p className={`${theme.text.secondary}`}>Upgrade to start booking mock interviews with top engineers</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular 
                    ? `border-2 border-[#06b6d4] ${theme.glass} relative ${theme.shadow}` 
                    : `${theme.border.primary} border ${theme.bg.card} ${theme.shadow}`
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] py-2 px-4 flex items-center justify-center gap-2">
                    <Star size={14} className="text-white fill-white" />
                    <span className="text-white font-bold text-xs uppercase tracking-wide">
                      Most Popular
                    </span>
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
                      <p className="text-[#06b6d4] text-sm mt-1 font-medium">{plan.savings}</p>
                    )}
                    <p className={`${theme.text.secondary} text-sm mt-1`}>₹{plan.perMonth.toLocaleString()}/month</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className={`${theme.text.secondary} text-sm`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/mentee/book"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                        : `${theme.bg.secondary} ${theme.text.primary} ${theme.bg.hover} ${theme.border.primary} border`
                    }`}
                  >
                    Choose Plan
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for Free Users */}
      {isFreeUser && (
        <div className="mb-8">
          <h3 className={`text-xl font-bold ${theme.text.primary} mb-4`}>Explore Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/mentee/book" 
              className={`p-4 ${theme.glass} ${theme.border.primary} border rounded-xl hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h4 className={`font-semibold ${theme.text.primary}`}>Book Mock</h4>
              </div>
              <p className={`text-sm ${theme.text.secondary}`}>Start the booking process</p>
            </Link>

            <Link 
              to="/mentee/resume-analyzer" 
              className={`p-4 ${theme.glass} ${theme.border.primary} border rounded-xl hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className={`font-semibold ${theme.text.primary}`}>AI Resume</h4>
              </div>
              <p className={`text-sm ${theme.text.secondary}`}>Analyze your resume</p>
            </Link>

            <Link 
              to="/mentee/interview-prep" 
              className={`p-4 ${theme.glass} ${theme.border.primary} border rounded-xl hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h4 className={`font-semibold ${theme.text.primary}`}>Interview Prep</h4>
              </div>
              <p className={`text-sm ${theme.text.secondary}`}>AI-powered preparation</p>
            </Link>

            <Link 
              to="/mentee/community" 
              className={`p-4 ${theme.glass} ${theme.border.primary} border rounded-xl hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className={`font-semibold ${theme.text.primary}`}>Community</h4>
              </div>
              <p className={`text-sm ${theme.text.secondary}`}>Connect with peers</p>
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Mock Interview */}
      {nextMock && (
        <div className={`${theme.glass} ${theme.border.primary} border rounded-2xl p-6 ${theme.shadow}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Upcoming Mock Interview</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className={`${theme.text.primary} font-medium`}>{new Date(nextMock.scheduled_at).toLocaleString()}</p>
              <p className={`${theme.text.secondary} text-sm`}>Status: <span className="capitalize">{nextMock.status}</span></p>
            </div>
            {nextMock.meet_link && (
              <a 
                href={nextMock.meet_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join Interview
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeDashboard;
