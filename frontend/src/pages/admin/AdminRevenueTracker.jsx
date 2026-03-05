import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminRevenueTracker = () => {
  const { theme } = useTheme();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date_from: '',
    date_to: ''
  });
  const [processingPayout, setProcessingPayout] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.date_from) params.date_from = dateRange.date_from;
      if (dateRange.date_to) params.date_to = dateRange.date_to;

      const response = await api.get('/admin/revenue-tracking', { params });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      toast.error('Failed to load revenue data');
    }
    setLoading(false);
  };

  const applyDateFilter = () => {
    fetchRevenueData();
  };

  const clearDateFilter = () => {
    setDateRange({ date_from: '', date_to: '' });
  };

  const handleMarkPayoutCompleted = async (mentorId) => {
    if (!window.confirm('Mark this payout as completed? This action cannot be undone.')) {
      return;
    }

    setProcessingPayout(mentorId);
    try {
      await api.post(`/admin/payouts/${mentorId}/complete`);
      toast.success('Payout marked as completed');
      fetchRevenueData();
    } catch (error) {
      console.error('Failed to mark payout as completed:', error);
      toast.error('Failed to update payout status');
    }
    setProcessingPayout(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const profitMargin = revenueData?.total_revenue > 0 
    ? (revenueData.net_profit / revenueData.total_revenue) 
    : 0;

  return (
    <DashboardLayout title="Revenue Tracker">
      {/* Date Range Filter */}
      <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-[#06b6d4]" />
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Date Range Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>From Date</label>
            <input
              type="date"
              value={dateRange.date_from}
              onChange={(e) => setDateRange({ ...dateRange, date_from: e.target.value })}
              className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>To Date</label>
            <input
              type="date"
              value={dateRange.date_to}
              onChange={(e) => setDateRange({ ...dateRange, date_to: e.target.value })}
              className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={applyDateFilter}
              className={`flex-1 px-4 py-2.5 ${theme.button.primary} rounded-lg font-medium transition-colors`}
            >
              Apply
            </button>
            <button
              onClick={clearDateFilter}
              className={`px-4 py-2.5 ${theme.button.secondary} rounded-lg transition-colors`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <p className={theme.text.muted}>Loading revenue data...</p>
        </div>
      ) : !revenueData ? (
        <div className="p-8 text-center">
          <p className={theme.text.muted}>No revenue data available</p>
        </div>
      ) : (
        <>
          {/* Key Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-green-400" />
                <p className={`text-sm ${theme.text.muted}`}>Total Revenue</p>
              </div>
              <p className={`text-2xl font-bold text-green-400`}>
                {formatCurrency(revenueData.total_revenue || 0)}
              </p>
            </div>
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={20} className="text-orange-400" />
                <p className={`text-sm ${theme.text.muted}`}>Payouts Owed</p>
              </div>
              <p className={`text-2xl font-bold text-orange-400`}>
                {formatCurrency(revenueData.total_payouts_owed || 0)}
              </p>
            </div>
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-[#06b6d4]" />
                <p className={`text-sm ${theme.text.muted}`}>Net Profit</p>
              </div>
              <p className={`text-2xl font-bold text-[#06b6d4]`}>
                {formatCurrency(revenueData.net_profit || 0)}
              </p>
            </div>
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-purple-400" />
                <p className={`text-sm ${theme.text.muted}`}>Profit Margin</p>
              </div>
              <p className={`text-2xl font-bold text-purple-400`}>
                {formatPercentage(profitMargin)}
              </p>
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-[#06b6d4]" />
              <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Revenue by Pricing Plan</h3>
            </div>
            
            {Object.keys(revenueData.revenue_by_plan || {}).length === 0 ? (
              <p className={theme.text.muted}>No plan revenue data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(revenueData.revenue_by_plan).map(([plan, amount]) => {
                  const percentage = revenueData.total_revenue > 0 
                    ? (amount / revenueData.total_revenue) * 100 
                    : 0;
                  
                  const colors = {
                    foundation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    growth: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    accelerator: 'bg-green-500/20 text-green-400 border-green-500/30'
                  };
                  
                  return (
                    <div
                      key={plan}
                      className={`${colors[plan] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} border rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{plan}</span>
                        <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/20 rounded-full h-2">
                          <div
                            className="bg-current h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mentor Payouts Table */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border overflow-hidden ${theme.shadowMd}`}>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <User size={20} className="text-[#06b6d4]" />
                <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Individual Mentor Payouts</h3>
              </div>
            </div>
            
            {!revenueData.mentor_payouts || revenueData.mentor_payouts.length === 0 ? (
              <div className="p-8 text-center">
                <p className={theme.text.muted}>No mentor payout data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={theme.bg.secondary}>
                    <tr>
                      <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentor Name</th>
                      <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Sessions Completed</th>
                      <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Payout Amount</th>
                      <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Status</th>
                      <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.mentor_payouts.map((payout) => (
                      <tr key={payout.mentor_id} className={`${theme.border.cardAlt} border-t hover:${theme.bg.secondary} transition-colors`}>
                        <td className={`p-4 ${theme.text.primary} font-medium`}>
                          {payout.mentor_name}
                        </td>
                        <td className={`p-4 ${theme.text.secondary}`}>
                          {payout.sessions_completed}
                        </td>
                        <td className={`p-4 ${theme.text.primary} font-medium`}>
                          {formatCurrency(payout.amount_owed)}
                        </td>
                        <td className="p-4">
                          {payout.status === 'completed' ? (
                            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {payout.status !== 'completed' && (
                            <button
                              onClick={() => handleMarkPayoutCompleted(payout.mentor_id)}
                              disabled={processingPayout === payout.mentor_id}
                              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                processingPayout === payout.mentor_id
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                            >
                              <CheckCircle size={16} />
                              {processingPayout === payout.mentor_id ? 'Processing...' : 'Mark as Paid'}
                            </button>
                          )}
                          {payout.status === 'completed' && (
                            <span className={`text-sm ${theme.text.muted}`}>Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mt-6 ${theme.shadowMd}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className={`text-sm ${theme.text.muted} mb-3`}>Revenue Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>Gross Revenue</span>
                    <span className={`${theme.text.primary} font-medium`}>
                      {formatCurrency(revenueData.total_revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>Mentor Payouts</span>
                    <span className="text-orange-400 font-medium">
                      - {formatCurrency(revenueData.total_payouts_owed || 0)}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between pt-2 border-t ${theme.border.cardAlt}`}>
                    <span className={`${theme.text.primary} font-medium`}>Net Profit</span>
                    <span className="text-[#06b6d4] font-bold text-lg">
                      {formatCurrency(revenueData.net_profit || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className={`text-sm ${theme.text.muted} mb-3`}>Key Metrics</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>Profit Margin</span>
                    <span className={`${theme.text.primary} font-medium`}>
                      {formatPercentage(profitMargin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>Total Mentors</span>
                    <span className={`${theme.text.primary} font-medium`}>
                      {revenueData.mentor_payouts?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>Avg Payout per Mentor</span>
                    <span className={`${theme.text.primary} font-medium`}>
                      {revenueData.mentor_payouts?.length > 0
                        ? formatCurrency(revenueData.total_payouts_owed / revenueData.mentor_payouts.length)
                        : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminRevenueTracker;
