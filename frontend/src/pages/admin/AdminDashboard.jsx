import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { Users, Calendar, MessageSquare, UserCheck, IndianRupee, TrendingUp, ShoppingCart } from 'lucide-react';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({ mentees: 0, mentors: 0, mocks: 0, feedbacks: 0 });
  const [revenue, setRevenue] = useState({ total_revenue: 0, total_orders: 0, plan_revenue: {}, plan_counts: {}, recent_orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mentees, mentors, mocks, feedbacks, revenueData] = await Promise.all([
          api.get('/admin/mentees'),
          api.get('/admin/mentors'),
          api.get('/admin/mocks'),
          api.get('/admin/feedbacks'),
          api.get('/admin/revenue-stats')
        ]);
        setStats({
          mentees: mentees.data.length,
          mentors: mentors.data.length,
          mocks: mocks.data.length,
          feedbacks: feedbacks.data.length
        });
        setRevenue(revenueData.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `₹${revenue.total_revenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: revenue.total_orders, icon: ShoppingCart, color: 'bg-cyan-500' },
    { label: 'Mentees', value: stats.mentees, icon: Users, color: 'bg-blue-500' },
    { label: 'Mentors', value: stats.mentors, icon: UserCheck, color: 'bg-violet-500' },
    { label: 'Mock Interviews', value: stats.mocks, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Feedbacks', value: stats.feedbacks, icon: MessageSquare, color: 'bg-rose-500' },
  ];

  const planNames = {
    monthly: 'Monthly',
    quarterly: '3 Months',
    biannual: '6 Months'
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 ${theme.shadowMd}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${theme.text.primary} mt-1`}>{loading ? '...' : stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 ${theme.shadowMd}`}>
          <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={20} className="text-[#06b6d4]" />
            Revenue by Plan
          </h3>
          {Object.keys(revenue.plan_revenue).length === 0 ? (
            <p className={`${theme.text.muted} text-sm`}>No revenue data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(revenue.plan_revenue).map(([plan, amount]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div>
                    <p className={`${theme.text.primary} font-medium`}>{planNames[plan] || plan}</p>
                    <p className={`${theme.text.muted} text-sm`}>{revenue.plan_counts[plan] || 0} orders</p>
                  </div>
                  <p className="text-xl font-bold text-[#06b6d4]">₹{amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 ${theme.shadowMd}`}>
          <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4 flex items-center gap-2`}>
            <ShoppingCart size={20} className="text-[#06b6d4]" />
            Recent Orders
          </h3>
          {revenue.recent_orders.length === 0 ? (
            <p className={`${theme.text.muted} text-sm`}>No orders yet</p>
          ) : (
            <div className="space-y-3">
              {revenue.recent_orders.slice(0, 5).map((order) => (
                <div key={order.id} className={`flex items-center justify-between py-2 ${theme.border.cardAlt} border-b last:border-0`}>
                  <div>
                    <p className={`${theme.text.primary} font-medium`}>{order.name}</p>
                    <p className={`${theme.text.muted} text-xs`}>{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#06b6d4] font-semibold">₹{(order.amount / 100).toLocaleString()}</p>
                    <p className={`${theme.text.muted} text-xs`}>{planNames[order.plan_id] || order.plan_id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
