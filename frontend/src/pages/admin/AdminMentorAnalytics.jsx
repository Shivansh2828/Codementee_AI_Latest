import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { TrendingUp, Calendar, ArrowUpDown, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminMentorAnalytics = () => {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date_from: '',
    date_to: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'total_slots_created',
    direction: 'desc'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.date_from) params.date_from = dateRange.date_from;
      if (dateRange.date_to) params.date_to = dateRange.date_to;

      const response = await api.get('/admin/mentor-analytics', { params });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch mentor analytics:', error);
      toast.error('Failed to load mentor analytics');
    }
    setLoading(false);
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const sorted = [...analytics].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setAnalytics(sorted);
  };

  const applyDateFilter = () => {
    fetchAnalytics();
  };

  const clearDateFilter = () => {
    setDateRange({ date_from: '', date_to: '' });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className={theme.text.muted} />;
    }
    return (
      <ArrowUpDown 
        size={14} 
        className={sortConfig.direction === 'asc' ? 'text-[#06b6d4] rotate-180' : 'text-[#06b6d4]'} 
      />
    );
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatRating = (value) => {
    return value ? value.toFixed(1) : 'N/A';
  };

  // Calculate summary stats
  const totalSlots = analytics.reduce((sum, m) => sum + m.total_slots_created, 0);
  const totalBooked = analytics.reduce((sum, m) => sum + m.total_slots_booked, 0);
  const totalCompleted = analytics.reduce((sum, m) => sum + m.total_sessions_completed, 0);
  const avgUtilization = analytics.length > 0 
    ? analytics.reduce((sum, m) => sum + m.utilization_rate, 0) / analytics.length 
    : 0;

  return (
    <DashboardLayout title="Mentor Analytics">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-[#06b6d4]" />
            <p className={`text-sm ${theme.text.muted}`}>Total Slots Created</p>
          </div>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{totalSlots}</p>
        </div>
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className={`text-sm ${theme.text.muted}`}>Total Booked</p>
          </div>
          <p className={`text-2xl font-bold text-green-400`}>{totalBooked}</p>
        </div>
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} className="text-yellow-400" />
            <p className={`text-sm ${theme.text.muted}`}>Avg Utilization</p>
          </div>
          <p className={`text-2xl font-bold text-yellow-400`}>{formatPercentage(avgUtilization)}</p>
        </div>
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-purple-400" />
            <p className={`text-sm ${theme.text.muted}`}>Total Completed</p>
          </div>
          <p className={`text-2xl font-bold text-purple-400`}>{totalCompleted}</p>
        </div>
      </div>

      {/* Mentor Metrics Table */}
      <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border overflow-hidden ${theme.shadowMd}`}>
        {loading ? (
          <div className="p-8 text-center">
            <p className={theme.text.muted}>Loading mentor analytics...</p>
          </div>
        ) : analytics.length === 0 ? (
          <div className="p-8 text-center">
            <p className={theme.text.muted}>No mentor data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme.bg.secondary}>
                <tr>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('mentor_name')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Mentor Name
                      {getSortIcon('mentor_name')}
                    </button>
                  </th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('total_slots_created')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Slots Created
                      {getSortIcon('total_slots_created')}
                    </button>
                  </th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('total_slots_booked')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Slots Booked
                      {getSortIcon('total_slots_booked')}
                    </button>
                  </th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('utilization_rate')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Utilization Rate
                      {getSortIcon('utilization_rate')}
                    </button>
                  </th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('average_rating')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Avg Rating
                      {getSortIcon('average_rating')}
                    </button>
                  </th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>
                    <button
                      onClick={() => handleSort('total_sessions_completed')}
                      className="flex items-center gap-2 hover:text-[#06b6d4] transition-colors"
                    >
                      Completed Sessions
                      {getSortIcon('total_sessions_completed')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((mentor) => (
                  <tr key={mentor.mentor_id} className={`${theme.border.cardAlt} border-t hover:${theme.bg.secondary} transition-colors`}>
                    <td className={`p-4 ${theme.text.primary} font-medium`}>
                      {mentor.mentor_name}
                    </td>
                    <td className={`p-4 ${theme.text.secondary}`}>
                      {mentor.total_slots_created}
                    </td>
                    <td className={`p-4 ${theme.text.secondary}`}>
                      {mentor.total_slots_booked}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-[#06b6d4] h-2 rounded-full transition-all"
                            style={{ width: `${mentor.utilization_rate * 100}%` }}
                          />
                        </div>
                        <span className={theme.text.secondary}>
                          {formatPercentage(mentor.utilization_rate)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className={theme.text.secondary}>
                          {formatRating(mentor.average_rating)}
                        </span>
                      </div>
                    </td>
                    <td className={`p-4 ${theme.text.secondary}`}>
                      {mentor.total_sessions_completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {!loading && analytics.length > 0 && (
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mt-6 ${theme.shadowMd}`}>
          <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${theme.text.muted} mb-2`}>Top Performer (Utilization)</p>
              <p className={`text-lg font-medium ${theme.text.primary}`}>
                {[...analytics].sort((a, b) => b.utilization_rate - a.utilization_rate)[0]?.mentor_name}
                <span className="text-[#06b6d4] ml-2">
                  {formatPercentage([...analytics].sort((a, b) => b.utilization_rate - a.utilization_rate)[0]?.utilization_rate)}
                </span>
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.muted} mb-2`}>Most Active (Sessions)</p>
              <p className={`text-lg font-medium ${theme.text.primary}`}>
                {[...analytics].sort((a, b) => b.total_sessions_completed - a.total_sessions_completed)[0]?.mentor_name}
                <span className="text-green-400 ml-2">
                  {[...analytics].sort((a, b) => b.total_sessions_completed - a.total_sessions_completed)[0]?.total_sessions_completed} sessions
                </span>
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.muted} mb-2`}>Highest Rated</p>
              <p className={`text-lg font-medium ${theme.text.primary}`}>
                {[...analytics].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))[0]?.mentor_name}
                <span className="text-yellow-400 ml-2">
                  ⭐ {formatRating([...analytics].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))[0]?.average_rating)}
                </span>
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.muted} mb-2`}>Total Active Mentors</p>
              <p className={`text-lg font-medium ${theme.text.primary}`}>
                {analytics.filter(m => m.total_slots_created > 0).length}
                <span className={`${theme.text.muted} ml-2 text-sm`}>
                  mentors with slots
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminMentorAnalytics;
