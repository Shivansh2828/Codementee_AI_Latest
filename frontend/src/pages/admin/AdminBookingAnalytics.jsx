import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { BarChart3, Clock, Building2, TrendingUp, Calendar, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminBookingAnalytics = () => {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date_from: '',
    date_to: ''
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

      const response = await api.get('/admin/booking-analytics', { params });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch booking analytics:', error);
      toast.error('Failed to load booking analytics');
    }
    setLoading(false);
  };

  const applyDateFilter = () => {
    fetchAnalytics();
  };

  const clearDateFilter = () => {
    setDateRange({ date_from: '', date_to: '' });
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatHours = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  // Get top items from objects
  const getTopItems = (obj, limit = 5) => {
    return Object.entries(obj || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  return (
    <DashboardLayout title="Booking Analytics">
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
          <p className={theme.text.muted}>Loading booking analytics...</p>
        </div>
      ) : !analytics ? (
        <div className="p-8 text-center">
          <p className={theme.text.muted}>No analytics data available</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-[#06b6d4]" />
                <p className={`text-sm ${theme.text.muted}`}>Avg Time to Booking</p>
              </div>
              <p className={`text-2xl font-bold ${theme.text.primary}`}>
                {formatHours(analytics.avg_time_to_booking || 0)}
              </p>
            </div>
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-400" />
                <p className={`text-sm ${theme.text.muted}`}>Cancellation Rate</p>
              </div>
              <p className={`text-2xl font-bold text-red-400`}>
                {formatPercentage(analytics.cancellation_rate || 0)}
              </p>
            </div>
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-400" />
                <p className={`text-sm ${theme.text.muted}`}>Total Bookings</p>
              </div>
              <p className={`text-2xl font-bold text-green-400`}>
                {Object.values(analytics.interview_type_counts || {}).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>

          {/* Popular Time Slots */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-[#06b6d4]" />
              <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Popular Time Slots</h3>
            </div>
            
            {Object.keys(analytics.popular_time_slots || {}).length === 0 ? (
              <p className={theme.text.muted}>No time slot data available</p>
            ) : (
              <div className="space-y-3">
                {getTopItems(analytics.popular_time_slots, 10).map(([slot, count]) => {
                  const maxCount = Math.max(...Object.values(analytics.popular_time_slots));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={slot}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={theme.text.secondary}>{slot}</span>
                        <span className={`${theme.text.primary} font-medium`}>{count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#06b6d4] h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interview Type Distribution */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-[#06b6d4]" />
              <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Interview Type Distribution</h3>
            </div>
            
            {Object.keys(analytics.interview_type_counts || {}).length === 0 ? (
              <p className={theme.text.muted}>No interview type data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.interview_type_counts).map(([type, count]) => {
                  const total = Object.values(analytics.interview_type_counts).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  
                  const colors = {
                    coding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    system_design: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    behavioral: 'bg-green-500/20 text-green-400 border-green-500/30',
                    hr_round: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  };
                  
                  return (
                    <div
                      key={type}
                      className={`${colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} border rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                        <span className="text-2xl font-bold">{count}</span>
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

          {/* Company Demand */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-[#06b6d4]" />
              <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Top Companies by Demand</h3>
            </div>
            
            {Object.keys(analytics.company_counts || {}).length === 0 ? (
              <p className={theme.text.muted}>No company data available</p>
            ) : (
              <div className="space-y-3">
                {getTopItems(analytics.company_counts, 10).map(([company, count]) => {
                  const maxCount = Math.max(...Object.values(analytics.company_counts));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={company}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={theme.text.secondary}>{company}</span>
                        <span className={`${theme.text.primary} font-medium`}>{count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Trends */}
          {analytics.booking_trends && analytics.booking_trends.length > 0 && (
            <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 ${theme.shadowMd}`}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#06b6d4]" />
                <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Booking Trends Over Time</h3>
              </div>
              
              <div className="space-y-3">
                {analytics.booking_trends.map((trend, index) => {
                  const maxCount = Math.max(...analytics.booking_trends.map(t => t.count));
                  const percentage = (trend.count / maxCount) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={theme.text.secondary}>{trend.period}</span>
                        <span className={`${theme.text.primary} font-medium`}>{trend.count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights Summary */}
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mt-6 ${theme.shadowMd}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${theme.text.muted} mb-2`}>Most Popular Interview Type</p>
                <p className={`text-lg font-medium ${theme.text.primary}`}>
                  {Object.entries(analytics.interview_type_counts || {}).sort(([, a], [, b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'N/A'}
                  <span className="text-[#06b6d4] ml-2">
                    ({Object.entries(analytics.interview_type_counts || {}).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} bookings)
                  </span>
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme.text.muted} mb-2`}>Most Requested Company</p>
                <p className={`text-lg font-medium ${theme.text.primary}`}>
                  {Object.entries(analytics.company_counts || {}).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                  <span className="text-green-400 ml-2">
                    ({Object.entries(analytics.company_counts || {}).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} bookings)
                  </span>
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme.text.muted} mb-2`}>Peak Booking Time</p>
                <p className={`text-lg font-medium ${theme.text.primary}`}>
                  {Object.entries(analytics.popular_time_slots || {}).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme.text.muted} mb-2`}>Booking Efficiency</p>
                <p className={`text-lg font-medium ${theme.text.primary}`}>
                  {analytics.avg_time_to_booking < 24 ? (
                    <span className="text-green-400">Excellent - Same day bookings</span>
                  ) : analytics.avg_time_to_booking < 72 ? (
                    <span className="text-yellow-400">Good - Within 3 days</span>
                  ) : (
                    <span className="text-orange-400">Moderate - {formatHours(analytics.avg_time_to_booking)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminBookingAnalytics;
