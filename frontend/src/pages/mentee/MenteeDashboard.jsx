import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Calendar, MessageSquare, TrendingUp, CreditCard, ArrowRight, Check, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MenteeDashboard = () => {
  const { user } = useAuth();
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
        <div className="bg-gradient-to-r from-[#06b6d4]/20 to-purple-500/20 border border-[#06b6d4]/30 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                🎉 You're exploring Codementee for free!
              </h3>
              <p className="text-slate-300 mb-2">
                Browse features, see how everything works, and upgrade when you're ready to book mock interviews.
              </p>
              <p className="text-[#06b6d4] text-sm font-medium">
                No pressure - take your time to explore!
              </p>
            </div>
            <Link to="/mentee/book" className="btn-primary whitespace-nowrap">
              Start Booking Process
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Mocks</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.mocks}</p>
              {isFreeUser && <p className="text-[#06b6d4] text-xs mt-1">Upgrade to book interviews</p>}
            </div>
            <div className="bg-purple-500 p-3 rounded-lg"><Calendar size={24} className="text-white" /></div>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Feedbacks Received</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.feedbacks}</p>
              {isFreeUser && <p className="text-[#06b6d4] text-xs mt-1">Available after interviews</p>}
            </div>
            <div className="bg-green-500 p-3 rounded-lg"><MessageSquare size={24} className="text-white" /></div>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <p className={`text-xl font-bold mt-1 capitalize ${isFreeUser ? 'text-slate-400' : 'text-[#06b6d4]'}`}>
                {user?.status || 'Free'}
              </p>
              {isFreeUser && <p className="text-slate-500 text-xs mt-1">Free exploration mode</p>}
            </div>
            <div className="bg-blue-500 p-3 rounded-lg"><TrendingUp size={24} className="text-white" /></div>
          </div>
        </div>
      </div>

      {/* Pricing Plans for Free Users */}
      {isFreeUser && pricingPlans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Choose Your Plan</h3>
            <p className="text-slate-400 text-sm">Upgrade to start booking mock interviews</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`rounded-xl overflow-hidden transition-all hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-2 border-[#06b6d4] bg-[#0f172a] relative shadow-lg shadow-[#06b6d4]/10' 
                    : 'border border-[#334155] bg-[#1e293b]'
                }`}
              >
                {plan.popular && (
                  <div className="bg-[#06b6d4] py-2 px-4 flex items-center justify-center gap-2">
                    <Star size={14} className="text-[#0f172a] fill-[#0f172a]" />
                    <span className="text-[#0f172a] font-bold text-xs uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                    <p className="text-slate-400 text-sm">{plan.duration}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-400">₹</span>
                      <span className="text-3xl font-bold text-white">{plan.price.toLocaleString()}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-[#06b6d4] text-sm mt-1">{plan.savings}</p>
                    )}
                    <p className="text-slate-400 text-sm mt-1">₹{plan.perMonth.toLocaleString()}/month</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={16} className="text-[#06b6d4] shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/mentee/book"
                    className={`w-full justify-center gap-2 ${
                      plan.popular ? 'btn-primary' : 'btn-secondary'
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

      {nextMock && (
        <div className="bg-[#1e293b] rounded-xl border border-[#06b6d4]/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Mock Interview</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-slate-300">{new Date(nextMock.scheduled_at).toLocaleString()}</p>
              <p className="text-slate-400 text-sm">Status: {nextMock.status}</p>
            </div>
            {nextMock.meet_link && (
              <a href={nextMock.meet_link} target="_blank" rel="noopener noreferrer" className="btn-primary">Join Interview</a>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeDashboard;
