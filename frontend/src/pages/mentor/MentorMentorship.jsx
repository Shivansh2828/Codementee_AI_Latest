import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, Calendar, Clock, ExternalLink, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const MentorMentorship = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMentorship = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/mentor/mentorship');
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
      <DashboardLayout title="Mentorship Sessions">
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
      <DashboardLayout title="Mentorship Sessions">
        <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
          <Users className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
          <p className={`${theme.text.primary} font-semibold mb-2`}>Failed to load mentorship data</p>
          <p className={`${theme.text.secondary} text-sm mb-4`}>Something went wrong. Please try again.</p>
          <Button onClick={fetchMentorship} className={theme.button.primary}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const mentees = data?.mentees || [];
  const upcomingSessions = data?.upcoming_sessions || [];
  const pastSessions = data?.past_sessions || [];

  // No mentees assigned
  if (mentees.length === 0) {
    return (
      <DashboardLayout title="Mentorship Sessions">
        <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className={`${theme.text.primary} text-xl font-bold mb-2`}>No Mentorship Mentees</h2>
          <p className={`${theme.text.secondary} text-sm max-w-md mx-auto`}>
            No mentorship mentees currently assigned. You'll see your assigned mentees here once the admin team assigns them.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentorship Sessions">
      <div className="space-y-6">
        {/* Assigned Mentees */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`${theme.text.primary} text-lg flex items-center gap-2`}>
              <Users className="w-5 h-5 text-[#06b6d4]" />
              Assigned Mentees
              <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-0 text-xs ml-2">
                {mentees.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentees.map((mentee) => {
                const sessionsRemaining = mentee.sessions_remaining ?? (mentee.sessions_total - mentee.sessions_used);
                return (
                  <div
                    key={mentee.id}
                    className={`${theme.bg.secondary} rounded-lg p-4 border ${theme.border.primary}`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {mentee.mentee_name?.charAt(0)?.toUpperCase() || 'M'}
                          </span>
                        </div>
                        <div>
                          <p className={`${theme.text.primary} font-semibold`}>{mentee.mentee_name}</p>
                          <p className={`${theme.text.secondary} text-sm flex items-center gap-1`}>
                            <Mail className="w-3 h-3" />
                            {mentee.mentee_email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className={`${theme.text.muted} text-xs`}>Plan</p>
                          <p className={`${theme.text.primary} font-medium`}>{mentee.plan_name}</p>
                        </div>
                        <div className="text-center">
                          <p className={`${theme.text.muted} text-xs`}>Remaining</p>
                          <p className={`font-bold ${sessionsRemaining > 0 ? 'text-[#06b6d4]' : 'text-red-400'}`}>
                            {sessionsRemaining}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`${theme.text.muted} text-xs`}>Expires</p>
                          <p className={`${theme.text.primary} font-medium`}>
                            {mentee.expires_at
                              ? new Date(mentee.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                        <p className={`${theme.text.primary} font-medium`}>{session.mentee_name}</p>
                        <p className={`${theme.text.secondary} text-sm`}>
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`${theme.text.muted} text-xs flex items-center gap-1`}>
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
                        <p className={`${theme.text.primary} font-medium`}>{session.mentee_name}</p>
                        <p className={`${theme.text.secondary} text-sm`}>
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`${theme.text.muted} text-xs flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          {session.start_time} – {session.end_time}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${session.feedback_id ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} border-0 text-xs`}>
                      {session.feedback_id ? 'Feedback Given' : 'No Feedback'}
                    </Badge>
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

export default MentorMentorship;
