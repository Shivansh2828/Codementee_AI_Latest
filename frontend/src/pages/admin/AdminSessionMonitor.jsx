import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { Calendar, Clock, User, Building2, Filter, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminSessionMonitor = () => {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    mentor_id: '',
    mentee_id: '',
    date_from: '',
    date_to: '',
    interview_type: ''
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const interviewTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'coding', label: 'Coding' },
    { value: 'system_design', label: 'System Design' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'hr_round', label: 'HR Round' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, mentorsRes, menteesRes] = await Promise.all([
        api.get('/admin/sessions', { params: filters }),
        api.get('/admin/mentors'),
        api.get('/admin/mentees')
      ]);
      setSessions(sessionsRes.data);
      setMentors(mentorsRes.data);
      setMentees(menteesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load sessions');
    }
    setLoading(false);
  };

  const applyFilters = () => {
    fetchData();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      mentor_id: '',
      mentee_id: '',
      date_from: '',
      date_to: '',
      interview_type: ''
    });
  };

  const handleCancelSession = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this session? Both mentor and mentee will be notified.')) {
      return;
    }

    try {
      await api.post(`/admin/sessions/${bookingId}/cancel`);
      toast.success('Session cancelled successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <DashboardLayout title="Session Monitor">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-6">
        <p className={theme.text.muted}>Monitor all scheduled and completed sessions</p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 ${theme.button.secondary} px-4 py-2 rounded-lg font-medium transition-colors relative`}
        >
          <Filter size={18} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#06b6d4] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-6 mb-6 ${theme.shadowMd}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Filter Sessions</h3>
            <button onClick={() => setShowFilters(false)} className={theme.text.muted}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Interview Type Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Interview Type</label>
              <select
                value={filters.interview_type}
                onChange={(e) => setFilters({ ...filters, interview_type: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              >
                {interviewTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Mentor Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Mentor</label>
              <select
                value={filters.mentor_id}
                onChange={(e) => setFilters({ ...filters, mentor_id: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              >
                <option value="">All Mentors</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Mentee Filter */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Mentee</label>
              <select
                value={filters.mentee_id}
                onChange={(e) => setFilters({ ...filters, mentee_id: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              >
                <option value="">All Mentees</option>
                {mentees.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              />
            </div>

            {/* Date To */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className={`w-full px-4 py-2.5 ${theme.input.base} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4]`}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className={`px-4 py-2 ${theme.button.secondary} rounded-lg transition-colors`}
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className={`px-4 py-2 ${theme.button.primary} rounded-lg font-medium transition-colors`}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border overflow-hidden ${theme.shadowMd}`}>
        {loading ? (
          <div className="p-8 text-center">
            <p className={theme.text.muted}>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className={`${theme.text.muted} mx-auto mb-4`} />
            <p className={theme.text.muted}>No sessions found</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className={`mt-4 ${theme.button.secondary} px-4 py-2 rounded-lg`}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme.bg.secondary}>
                <tr>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Date & Time</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentor</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentee</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Company</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Type</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Status</th>
                  <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className={`${theme.border.cardAlt} border-t`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#06b6d4]" />
                        <div>
                          <p className={theme.text.primary}>{formatDate(session.date)}</p>
                          <p className={`text-sm ${theme.text.muted}`}>
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className={theme.text.muted} />
                        <div>
                          <p className={theme.text.primary}>{session.mentor_name}</p>
                          <p className={`text-sm ${theme.text.muted}`}>{session.mentor_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className={theme.text.muted} />
                        <div>
                          <p className={theme.text.primary}>{session.mentee_name}</p>
                          <p className={`text-sm ${theme.text.muted}`}>{session.mentee_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className={theme.text.muted} />
                        <p className={theme.text.secondary}>{session.company_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${theme.bg.secondary} ${theme.text.secondary}`}>
                        {session.interview_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="p-4">
                      {session.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <span className={`text-sm ${theme.text.muted}`}>Completed</span>
                      )}
                      {session.status === 'cancelled' && (
                        <span className={`text-sm ${theme.text.muted}`}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
            <p className={`text-sm ${theme.text.muted} mb-1`}>Total Sessions</p>
            <p className={`text-2xl font-bold ${theme.text.primary}`}>{sessions.length}</p>
          </div>
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
            <p className={`text-sm ${theme.text.muted} mb-1`}>Confirmed</p>
            <p className={`text-2xl font-bold text-blue-400`}>
              {sessions.filter(s => s.status === 'confirmed').length}
            </p>
          </div>
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
            <p className={`text-sm ${theme.text.muted} mb-1`}>Completed</p>
            <p className={`text-2xl font-bold text-green-400`}>
              {sessions.filter(s => s.status === 'completed').length}
            </p>
          </div>
          <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border p-4 ${theme.shadowMd}`}>
            <p className={`text-sm ${theme.text.muted} mb-1`}>Cancelled</p>
            <p className={`text-2xl font-bold text-red-400`}>
              {sessions.filter(s => s.status === 'cancelled').length}
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminSessionMonitor;
