import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MenteeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ mocks: 0, feedbacks: 0 });
  const [nextMock, setNextMock] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mocks, feedbacks] = await Promise.all([api.get('/mocks'), api.get('/mentee/feedbacks')]);
        setStats({ mocks: mocks.data.length, feedbacks: feedbacks.data.length });
        const upcoming = mocks.data.filter(m => m.status === 'scheduled').sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
        setNextMock(upcoming);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Welcome back!">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Total Mocks</p><p className="text-3xl font-bold text-white mt-1">{stats.mocks}</p></div>
            <div className="bg-purple-500 p-3 rounded-lg"><Calendar size={24} className="text-white" /></div>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Feedbacks Received</p><p className="text-3xl font-bold text-white mt-1">{stats.feedbacks}</p></div>
            <div className="bg-green-500 p-3 rounded-lg"><MessageSquare size={24} className="text-white" /></div>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Status</p><p className="text-xl font-bold text-[#06b6d4] mt-1 capitalize">{user?.status || 'Active'}</p></div>
            <div className="bg-blue-500 p-3 rounded-lg"><TrendingUp size={24} className="text-white" /></div>
          </div>
        </div>
      </div>

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
