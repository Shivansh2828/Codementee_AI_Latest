import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { DollarSign, Clock, CheckCircle, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const MentorPayouts = () => {
  const { theme } = useTheme();
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await api.get('/mentor/payouts');
      setPayouts(response.data);
    } catch (error) {
      toast.error('Failed to fetch payouts');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/mentor/payout-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch payout stats:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'approved': return 'text-blue-500 bg-blue-500/10';
      case 'paid': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="My Payouts">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Payouts">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#06b6d4] text-sm font-medium">Total Earned</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.total_earned || 0)}</p>
              <p className="text-xs text-gray-500">{stats.total_sessions || 0} sessions</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#06b6d4]" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-500 text-sm font-medium">Pending</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.pending_amount || 0)}</p>
              <p className="text-xs text-gray-500">{stats.pending_sessions || 0} sessions</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-500 text-sm font-medium">Paid Out</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.paid_amount || 0)}</p>
              <p className="text-xs text-gray-500">{stats.paid_sessions || 0} sessions</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-500 text-sm font-medium">Per Session</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>₹800</p>
              <p className="text-xs text-gray-500">Standard rate</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className={`${theme.glass} rounded-xl ${theme.border.primary} border overflow-hidden`}>
        <div className={`${theme.bg.secondary} px-6 py-4 border-b ${theme.border.primary}`}>
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Payout History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme.bg.secondary}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Mock Interview</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Amount</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Status</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payouts.map((payout) => (
                <tr key={payout.id} className={`${theme.bg.hover}`}>
                  <td className="px-6 py-4">
                    {payout.mock_details && (
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${theme.bg.secondary} rounded-lg flex items-center justify-center`}>
                          <Building2 size={20} className="text-[#06b6d4]" />
                        </div>
                        <div>
                          <p className={`font-medium ${theme.text.primary}`}>{payout.mock_details.company_name}</p>
                          <p className={`text-sm ${theme.text.secondary}`}>
                            {payout.mock_details.interview_type?.replace('_', ' ')} Interview
                          </p>
                          <p className={`text-xs ${theme.text.muted}`}>
                            with {payout.mock_details.mentee_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${theme.text.primary}`}>{formatAmount(payout.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={`${theme.text.muted}`} />
                      <span className={`text-sm ${theme.text.secondary}`}>
                        {formatDate(payout.created_at)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payouts.length === 0 && (
          <div className="text-center py-12">
            <DollarSign size={48} className={`mx-auto ${theme.text.muted} mb-4`} />
            <p className={`${theme.text.secondary} mb-2`}>No payouts yet</p>
            <p className={`text-sm ${theme.text.muted}`}>
              Complete mock interviews to start earning
            </p>
          </div>
        )}
      </div>

      {/* Payout Information */}
      <div className={`mt-8 ${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
        <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Payout Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium ${theme.text.primary} mb-2`}>Payment Schedule</h4>
            <ul className={`text-sm ${theme.text.secondary} space-y-1`}>
              <li>• Payouts are processed after mock interview completion</li>
              <li>• Admin reviews and approves payouts within 2-3 business days</li>
              <li>• Approved payouts are transferred within 5-7 business days</li>
            </ul>
          </div>
          <div>
            <h4 className={`font-medium ${theme.text.primary} mb-2`}>Payment Rates</h4>
            <ul className={`text-sm ${theme.text.secondary} space-y-1`}>
              <li>• Standard rate: ₹800 per 45-60 minute session</li>
              <li>• All rates are inclusive of applicable taxes</li>
              <li>• Payments are made via bank transfer</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorPayouts;