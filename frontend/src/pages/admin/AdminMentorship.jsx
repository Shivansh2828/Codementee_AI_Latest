import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Calendar, Clock, UserPlus, Activity, Mail, Send, Settings, History } from 'lucide-react';
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

  // Enrollment email state
  const [allUsers, setAllUsers] = useState([]);
  const [mentorshipPlans, setMentorshipPlans] = useState([]);
  const [mockPlans, setMockPlans] = useState([]);
  const [enrollmentSettings, setEnrollmentSettings] = useState({
    mentorship_payment_link: '',
    mock_interview_payment_link: '',
    default_message: '',
    included_courses: [],
  });
  const [enrollForm, setEnrollForm] = useState({
    user_id: '',
    service_type: 'mentorship',
    plan_id: '',
    payment_link: '',
    custom_message: '',
    include_course_access: true,
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('subscriptions'); // subscriptions | enrollment | settings | history

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mentorshipRes, mentorsRes, usersRes, settingsRes, historyRes] = await Promise.all([
        api.get('/admin/mentorship'),
        api.get('/admin/mentors'),
        api.get('/admin/users'),
        api.get('/admin/enrollment-settings').catch(() => ({ data: {} })),
        api.get('/admin/enrollment-emails').catch(() => ({ data: [] })),
      ]);
      setData(mentorshipRes.data);
      setMentors(mentorsRes.data);
      setAllUsers(usersRes.data.filter(u => u.role === 'mentee' || u.role === 'agent_user'));
      if (settingsRes.data) {
        setEnrollmentSettings({
          mentorship_payment_link: settingsRes.data.mentorship_payment_link || 'https://codementee.io/mentorship',
          mock_interview_payment_link: settingsRes.data.mock_interview_payment_link || 'https://codementee.io/pricing',
          default_message: settingsRes.data.default_message || '',
          included_courses: settingsRes.data.included_courses || ['DevOps & Cloud Engineering', 'AWS Solutions Architect'],
        });
      }
      setEmailHistory(historyRes.data || []);

      // Fetch plans
      const [mentorshipPlansRes, mockPlansRes] = await Promise.all([
        api.get('/pricing-plans?currency=INR&service_type=mentorship'),
        api.get('/pricing-plans?currency=INR&service_type=mock_interview'),
      ]);
      setMentorshipPlans(mentorshipPlansRes.data.filter(p => p.is_active !== false));
      setMockPlans(mockPlansRes.data.filter(p => p.is_active !== false));
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

  const handleSendEnrollmentEmail = async () => {
    if (!enrollForm.user_id || !enrollForm.plan_id) {
      toast.error('Please select a user and plan');
      return;
    }
    setSendingEmail(true);
    try {
      const payload = {
        user_id: enrollForm.user_id,
        service_type: enrollForm.service_type,
        plan_id: enrollForm.plan_id,
        include_course_access: enrollForm.include_course_access,
      };
      if (enrollForm.payment_link) payload.payment_link = enrollForm.payment_link;
      if (enrollForm.custom_message) payload.custom_message = enrollForm.custom_message;

      const res = await api.post('/admin/send-enrollment-email', payload);
      toast.success(res.data.message || 'Enrollment email sent!');
      setEnrollForm({ user_id: '', service_type: 'mentorship', plan_id: '', payment_link: '', custom_message: '', include_course_access: true });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/admin/enrollment-settings', enrollmentSettings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
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
        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'subscriptions', label: 'Subscriptions', icon: Users },
            { id: 'enrollment', label: 'Send Enrollment', icon: Mail },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'history', label: 'Email History', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#06b6d4] text-white'
                  : `${theme.bg.secondary} ${theme.text.secondary}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

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

        {/* ===== SUBSCRIPTIONS TAB ===== */}
        {activeTab === 'subscriptions' && (
          <>
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
          </>
        )}

        {/* ===== ENROLLMENT EMAIL TAB ===== */}
        {activeTab === 'enrollment' && (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardHeader className="pb-3">
              <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
                <Send className="w-5 h-5 text-[#06b6d4]" />
                Send Enrollment Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Select User</Label>
                  <Select
                    value={enrollForm.user_id}
                    onValueChange={(val) => setEnrollForm(prev => ({ ...prev, user_id: val }))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose a registered user" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Service Type</Label>
                  <Select
                    value={enrollForm.service_type}
                    onValueChange={(val) => setEnrollForm(prev => ({ ...prev, service_type: val, plan_id: '' }))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentorship">1:1 Mentorship</SelectItem>
                      <SelectItem value="mock_interview">Mock Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Plan</Label>
                  <Select
                    value={enrollForm.plan_id}
                    onValueChange={(val) => setEnrollForm(prev => ({ ...prev, plan_id: val }))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(enrollForm.service_type === 'mentorship' ? mentorshipPlans : mockPlans).map(p => (
                        <SelectItem key={p.plan_id} value={p.plan_id}>
                          {p.name} — ₹{(p.price_inr || p.price || 0) / 100}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Payment Link (optional override)</Label>
                  <Input
                    value={enrollForm.payment_link}
                    onChange={(e) => setEnrollForm(prev => ({ ...prev, payment_link: e.target.value }))}
                    placeholder="Leave empty to use default from settings"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Custom Message (optional)</Label>
                <textarea
                  value={enrollForm.custom_message}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, custom_message: e.target.value }))}
                  placeholder="Leave empty to use default message from settings"
                  className={`w-full h-20 rounded-lg p-3 text-sm ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} resize-none`}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="include_courses"
                  checked={enrollForm.include_course_access}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, include_course_access: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 text-[#06b6d4] focus:ring-[#06b6d4]"
                />
                <Label htmlFor="include_courses" className={`${theme.text.secondary} text-sm cursor-pointer`}>
                  Include complimentary tech resources (DevOps course, etc.) in email
                </Label>
              </div>

              <Button
                onClick={handleSendEnrollmentEmail}
                disabled={sendingEmail || !enrollForm.user_id || !enrollForm.plan_id}
                className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-6 py-2 flex items-center gap-2"
              >
                {sendingEmail ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Enrollment Email</>
                )}
              </Button>

              <p className={`${theme.text.muted} text-xs`}>
                Email will be BCC'd to support@codementee.com automatically.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardHeader className="pb-3">
              <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
                <Settings className="w-5 h-5 text-[#06b6d4]" />
                Enrollment Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Mentorship Payment Link</Label>
                  <Input
                    value={enrollmentSettings.mentorship_payment_link}
                    onChange={(e) => setEnrollmentSettings(prev => ({ ...prev, mentorship_payment_link: e.target.value }))}
                    placeholder="https://codementee.io/mentorship"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Mock Interview Payment Link</Label>
                  <Input
                    value={enrollmentSettings.mock_interview_payment_link}
                    onChange={(e) => setEnrollmentSettings(prev => ({ ...prev, mock_interview_payment_link: e.target.value }))}
                    placeholder="https://codementee.io/pricing"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Default Email Message</Label>
                <textarea
                  value={enrollmentSettings.default_message}
                  onChange={(e) => setEnrollmentSettings(prev => ({ ...prev, default_message: e.target.value }))}
                  placeholder="We'd love to have you join our mentorship program!"
                  className={`w-full h-20 rounded-lg p-3 text-sm ${theme.bg.secondary} ${theme.text.primary} border ${theme.border.primary} resize-none`}
                />
              </div>

              <div>
                <Label className={`${theme.text.secondary} text-sm mb-1 block`}>Included Courses (comma-separated)</Label>
                <Input
                  value={(enrollmentSettings.included_courses || []).join(', ')}
                  onChange={(e) => setEnrollmentSettings(prev => ({
                    ...prev,
                    included_courses: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="DevOps & Cloud Engineering, AWS Solutions Architect"
                  className="h-9 text-sm"
                />
                <p className={`${theme.text.muted} text-xs mt-1`}>These courses will be shown as complimentary in the enrollment email.</p>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-6 py-2"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ===== EMAIL HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardHeader className="pb-3">
              <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
                <History className="w-5 h-5 text-[#06b6d4]" />
                Sent Enrollment Emails
                {emailHistory.length > 0 && (
                  <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-0 text-xs ml-2">
                    {emailHistory.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailHistory.length === 0 ? (
                <p className={`${theme.text.muted} text-sm text-center py-4`}>No enrollment emails sent yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`${theme.bg.secondary}`}>
                        <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Sent To</th>
                        <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Service</th>
                        <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Plan</th>
                        <th className={`text-left p-3 ${theme.text.muted} font-medium text-sm`}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailHistory.map((entry) => (
                        <tr key={entry.id} className={`${theme.border.primary} border-t`}>
                          <td className={`p-3 ${theme.text.primary} text-sm`}>
                            {entry.sent_to_name}<br />
                            <span className={`${theme.text.muted} text-xs`}>{entry.sent_to_email}</span>
                          </td>
                          <td className="p-3 text-sm">
                            <Badge className={entry.service_type === 'mentorship' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}>
                              {entry.service_type === 'mentorship' ? 'Mentorship' : 'Mock Interview'}
                            </Badge>
                          </td>
                          <td className={`p-3 ${theme.text.secondary} text-sm`}>{entry.plan_name}</td>
                          <td className={`p-3 ${theme.text.secondary} text-sm`}>
                            {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminMentorship;
