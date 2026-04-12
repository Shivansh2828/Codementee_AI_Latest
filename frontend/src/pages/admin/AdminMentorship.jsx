import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Calendar, Clock, UserPlus, Activity } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const AdminMentorship = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [scheduleForm, setScheduleForm] = useState({
    subscription_id: '',
    date: '',
    start_time: '',
    end_time: ''
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mentorshipRes, mentorsRes] = await Promise.all([
        api.get('/admin/mentorship'),
        api.get('/admin/mentors')
      ]);
      setData(mentorshipRes.data);
      setMentors(mentorsRes.data);
    } catch (err) {
      console.error('Failed to fetch mentorship data:', err);
      toast.error('Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignMentor = async (subscriptionId, mentorId) => {
    setAssigning((prev) => ({ ...prev, [subscriptionId]: true }));
    try {
      await api.post('/admin/mentorship/assign-mentor', {
        subscription_id: subscriptionId,
        mentor_id: mentorId
      });
      toast.success('Mentor assigned successfully');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to assign mentor';
      toast.error(msg);
    } finally {
      setAssigning((prev) => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!scheduleForm.subscription_id || !scheduleForm.date || !scheduleForm.start_time || !scheduleForm.end_time) {
      toast.error('Please fill in all fields');
      return;
    }
    setScheduling(true);
    try {
      await api.post('/admin/mentorship/schedule-session', scheduleForm);
      toast.success('Session scheduled successfully');
      setScheduleForm({ subscription_id: '', date: '', start_time: '', end_time: '' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to schedule session';
      toast.error(msg);
    } finally {
      setScheduling(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      expired: 'bg-red-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-gray-400'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const summary = data?.summary || {};
  const subscriptions = data?.subscriptions || [];

  // Filter subscriptions that have a mentor assigned for the schedule dropdown
  const assignedSubscriptions = subscriptions.filter((s) => s.mentor_id && s.status === 'active');

  if (loading) {
    return (
      <DashboardLayout title="Mentorship Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading mentorship data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentorship Management">
      <div className="space-y-6">
        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <p className={`${theme.text.muted} text-xs`}>Active</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.active_count || 0}</p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <p className={`${theme.text.muted} text-xs`}>Expired</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{summary.expired_count || 0}</p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-yellow-400" />
                <p className={`${theme.text.muted} text-xs`}>Unassigned</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{summary.unassigned_count || 0}</p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-[#06b6d4]" />
                <p className={`${theme.text.muted} text-xs`}>Total Sessions</p>
              </div>
              <p className="text-2xl font-bold text-[#06b6d4]">{summary.total_sessions || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Table */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Users className="w-5 h-5 text-[#06b6d4]" />
              Subscriptions
              {subscriptions.length > 0 && (
                <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-0 text-xs ml-2">
                  {subscriptions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className={`${theme.text.muted} text-sm text-center py-4`}>No mentorship subscriptions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${theme.bg.secondary}`}>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Mentee</th>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Plan</th>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Mentor</th>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Sessions</th>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Status</th>
                      <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className={`${theme.border.primary} border-t`}>
                        <td className={`p-3 ${theme.text.primary}`}>{sub.mentee_name}</td>
                        <td className={`p-3 ${theme.text.secondary} text-sm`}>{sub.plan_name}</td>
                        <td className="p-3">
                          {sub.mentor_id ? (
                            <span className={theme.text.primary}>{sub.mentor_name}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                onValueChange={(mentorId) => handleAssignMentor(sub.id, mentorId)}
                                disabled={assigning[sub.id]}
                              >
                                <SelectTrigger className="w-[180px] h-8 text-sm">
                                  <SelectValue placeholder="Assign mentor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mentors.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {assigning[sub.id] && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#06b6d4]"></div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className={`p-3 ${theme.text.primary} text-sm`}>
                          {sub.sessions_used}/{sub.sessions_total}
                        </td>
                        <td className="p-3">{getStatusBadge(sub.status)}</td>
                        <td className={`p-3 ${theme.text.secondary} text-sm`}>
                          {sub.expires_at
                            ? new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Scheduling Form */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Calendar className="w-5 h-5 text-[#06b6d4]" />
              Schedule Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleSession} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Subscription</Label>
                <Select
                  value={scheduleForm.subscription_id}
                  onValueChange={(val) => setScheduleForm((prev) => ({ ...prev, subscription_id: val }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedSubscriptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.mentee_name} — {s.plan_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Date</Label>
                <Input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Start Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>End Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Button type="submit" disabled={scheduling} className={`${theme.button.primary} w-full h-9 text-sm`}>
                  {scheduling ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminMentorship;
