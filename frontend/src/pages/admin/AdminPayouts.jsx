import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { DollarSign, Clock, CheckCircle, XCircle, Eye, Edit3, Filter } from 'lucide-react';
import { toast } from 'sonner';

const AdminPayouts = () => {
  const { theme } = useTheme();
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, [filter]);

  const fetchPayouts = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/admin/payouts', { params });
      setPayouts(response.data);
    } catch (error) {
      toast.error('Failed to fetch payouts');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/payout-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch payout stats:', error);
    }
  };

  const updatePayoutStatus = async (payoutId, status, adminNotes = '') => {
    setUpdating(true);
    try {
      await api.put(`/admin/payouts/${payoutId}`, {
        status,
        admin_notes: adminNotes
      });
      toast.success(`Payout ${status} successfully`);
      fetchPayouts();
      fetchStats();
      setSelectedPayout(null);
    } catch (error) {
      toast.error(`Failed to ${status} payout`);
    }
    setUpdating(false);
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
      <DashboardLayout title="Mentor Payouts">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentor Payouts">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Payouts</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{stats.total_payouts || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#06b6d4]" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-500 text-sm">Pending</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.pending_amount || 0)}</p>
              <p className="text-xs text-gray-500">{stats.pending_count || 0} payouts</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-500 text-sm">Approved</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.approved_amount || 0)}</p>
              <p className="text-xs text-gray-500">{stats.approved_count || 0} payouts</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-500 text-sm">Paid</p>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>{formatAmount(stats.paid_amount || 0)}</p>
              <p className="text-xs text-gray-500">{stats.paid_count || 0} payouts</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'paid', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-[#06b6d4] text-white'
                : `${theme.bg.secondary} ${theme.text.secondary} hover:${theme.text.primary}`
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className={`${theme.glass} rounded-xl ${theme.border.primary} border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme.bg.secondary}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Mentor</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Mock Details</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Amount</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Status</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Created</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${theme.text.secondary}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payouts.map((payout) => (
                <tr key={payout.id} className={`${theme.bg.hover}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${theme.text.primary}`}>{payout.mentor_name}</p>
                      <p className={`text-sm ${theme.text.secondary}`}>{payout.mentor_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {payout.mock_details && (
                      <div>
                        <p className={`font-medium ${theme.text.primary}`}>{payout.mock_details.company_name}</p>
                        <p className={`text-sm ${theme.text.secondary}`}>
                          {payout.mock_details.interview_type} • {payout.mock_details.mentee_name}
                        </p>
                        <p className={`text-xs ${theme.text.muted}`}>
                          {formatDate(payout.mock_details.scheduled_at)}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${theme.text.primary}`}>{formatAmount(payout.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${theme.text.secondary}`}>{formatDate(payout.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className={`p-2 rounded-lg ${theme.bg.secondary} ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
                      >
                        <Eye size={16} />
                      </button>
                      {payout.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePayoutStatus(payout.id, 'approved')}
                            disabled={updating}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                            disabled={updating}
                            className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {payout.status === 'approved' && (
                        <button
                          onClick={() => updatePayoutStatus(payout.id, 'paid')}
                          disabled={updating}
                          className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
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
            <p className={`${theme.text.secondary}`}>No payouts found</p>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.bg.card} rounded-xl p-6 max-w-md w-full ${theme.border.primary} border`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Payout Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`text-sm ${theme.text.secondary}`}>Mentor</label>
                <p className={`font-medium ${theme.text.primary}`}>{selectedPayout.mentor_name}</p>
              </div>
              
              <div>
                <label className={`text-sm ${theme.text.secondary}`}>Amount</label>
                <p className={`font-bold text-lg ${theme.text.primary}`}>{formatAmount(selectedPayout.amount)}</p>
              </div>
              
              <div>
                <label className={`text-sm ${theme.text.secondary}`}>Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                  {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                </span>
              </div>
              
              {selectedPayout.notes && (
                <div>
                  <label className={`text-sm ${theme.text.secondary}`}>Notes</label>
                  <p className={`${theme.text.primary}`}>{selectedPayout.notes}</p>
                </div>
              )}
              
              {selectedPayout.admin_notes && (
                <div>
                  <label className={`text-sm ${theme.text.secondary}`}>Admin Notes</label>
                  <p className={`${theme.text.primary}`}>{selectedPayout.admin_notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedPayout(null)}
                className={`flex-1 px-4 py-2 ${theme.bg.secondary} ${theme.text.secondary} rounded-lg hover:${theme.text.primary} transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPayouts;