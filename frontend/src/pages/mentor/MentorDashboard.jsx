import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Users, Calendar, MessageSquare } from 'lucide-react';

const MentorDashboard = () => {
  const [stats, setStats] = useState({ mentees: 0, mocks: 0, feedbacks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mentees, mocks, feedbacks] = await Promise.all([
          api.get('/mentor/mentees'),
          api.get('/mocks'),
          api.get('/mentor/feedbacks')
        ]);
        setStats({ mentees: mentees.data.length, mocks: mocks.data.length, feedbacks: feedbacks.data.length });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'My Mentees', value: stats.mentees, icon: Users, color: 'bg-blue-500' },
    { label: 'Mock Interviews', value: stats.mocks, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Feedbacks Given', value: stats.feedbacks, icon: MessageSquare, color: 'bg-green-500' },
  ];

  return (
    <DashboardLayout title="Mentor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}><Icon size={24} className="text-white" /></div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
