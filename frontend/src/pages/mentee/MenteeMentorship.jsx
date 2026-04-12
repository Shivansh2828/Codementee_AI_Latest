import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, Calendar, Clock, ExternalLink, RefreshCw, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const MenteeMentorship = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMentorship = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/mentee/mentorship');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch mentorship data:', err);
      toast.error('Failed to load mentorship data');
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentorship();
  }, [fetchMentorship]);

  if (loading) {
    return (
      <DashboardLayout title="1:1 Mentorship">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading mentorship data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="1:1 Mentorship">
        <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
          <Users className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
          <p className={`${theme.text.primary} font-semibold mb-2`}>Failed to load mentorship data</p>
          <p className={`${theme.text.secondary} text-sm mb-4`}>Something went wrong. Please try again.</p>
          <Button onClick={fetchMentorship} className={theme.button.primary}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const subscription = data?.subscription;
  const upcomingSessions = data?.upcoming_sessions || [];
  const pastSessions = data?.past_sessions || [];

  // No subscription — show upgrade prompt
  if (!subscription) {
    return (
      <DashboardLayout title="1:1 Mentorship">
        <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className={`${theme.text.primary} text-xl font-bold mb-2`}>Get 1:1 Mentorship</h2>
          <p className={`${theme.text.secondary} text-sm mb-6 max-w-md mx-auto`}>
            Get paired with an experienced mentor for personalized guidance, regular sessions, and career growth support.
          </p>
          <Link to="/mentorship">
            <Button className={theme.button.primary}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              View Mentorship Plans
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const sessionsRemaining = (subscription.sessions_total || 0) - (subscription.sessions_used || 0);

  return (
    <DashboardLayout title="1:1 Mentorship">
      <div className="space-y-6">
        {/* Subscription Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <p className={`${theme.text.muted} text-xs mb-1`}>Plan</p>
              <p className={`${theme.text.primary} font-semibold`}>{subscription.plan_name}</p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <p className={`${theme.text.muted} text-xs mb-1`}>Sessions Remaining</p>
              <p className={`text-2xl font-bold ${sessionsRemaining > 0 ? 'text-[#06b6d4]' : 'text-red-400'}`}>
                {sessionsRemaining}
                <span className={`${theme.text.muted} text-sm font-normal`}> / {subscription.sessions_total}</span>
              </p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <p className={`${theme.text.muted} text-xs mb-1`}>Sessions Used</p>
              <p className={`${theme.text.primary} text-2xl font-bold`}>{subscription.sessions_used || 0}</p>
            </CardContent>
          </Card>
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-4">
              <p className={`${theme.text.muted} text-xs mb-1`}>Expires</p>
              <p className={`${theme.text.primary} font-semibold`}>
                {subscription.expires_at
                  ? new Date(subscription.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Info */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Users className="w-5 h-5 text-[#06b6d4]" />
              Your Mentor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.mentor_id ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {subscription.mentor_name?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>{subscription.mentor_name}</p>
                  <p className={`${theme.text.secondary} text-sm`}>{subscription.mentor_email}</p>
                </div>
              </div>
            ) : (
              <div className={`${theme.bg.secondary} rounded-lg p-4 text-center`}>
                <Users className={`w-8 h-8 ${theme.text.muted} mx-auto mb-2`} />
                <p className={`${theme.text.secondary} text-sm`}>A mentor will be assigned by the admin team</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Calendar className="w-5 h-5 text-[#06b6d4]" />
              Upcoming Sessions
              {upcomingSessions.length > 0 && (
                <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-0 text-xs ml-2">
                  {upcomingSessions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className={`${theme.text.muted} text-sm text-center py-4`}>No upcoming sessions scheduled</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`${theme.bg.secondary} rounded-lg p-4 border ${theme.border.primary} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#06b6d4]" />
                      </div>
                      <div>
                        <p className={`${theme.text.primary} font-medium`}>
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`${theme.text.secondary} text-sm flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          {session.start_time} – {session.end_time}
                        </p>
                      </div>
                    </div>
                    {session.meeting_link && (
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className={theme.button.primary}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Clock className="w-5 h-5 text-gray-400" />
              Past Sessions
              {pastSessions.length > 0 && (
                <Badge className="bg-gray-500/20 text-gray-400 border-0 text-xs ml-2">
                  {pastSessions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastSessions.length === 0 ? (
              <p className={`${theme.text.muted} text-sm text-center py-4`}>No past sessions yet</p>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`${theme.bg.secondary} rounded-lg p-4 border ${theme.border.primary} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className={`${theme.text.primary} font-medium`}>
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`${theme.text.secondary} text-sm flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          {session.start_time} – {session.end_time}
                        </p>
                      </div>
                    </div>
                    {session.feedback_id && (
                      <Link to={`/mentee/feedbacks`}>
                        <Button size="sm" variant="outline" className={theme.button.secondary}>
                          View Feedback
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenteeMentorship;
