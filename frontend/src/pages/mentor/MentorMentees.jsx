import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  User, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  Mail,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const MentorMentees = () => {
  const { theme } = useTheme();
  const [menteesData, setMenteesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenteesData();
  }, []);

  const fetchMenteesData = async () => {
    try {
      // Fetch all completed bookings for this mentor
      const bookingsRes = await api.get('/mentor/bookings');
      const allBookings = [...(bookingsRes.data.completed || []), ...(bookingsRes.data.upcoming || [])];
      
      // Group by mentee
      const menteeMap = {};
      allBookings.forEach(booking => {
        const menteeId = booking.mentee_id;
        if (!menteeMap[menteeId]) {
          menteeMap[menteeId] = {
            id: menteeId,
            name: booking.mentee_name,
            email: booking.mentee_email,
            sessions: [],
            totalSessions: 0,
            companies: new Set(),
            interviewTypes: new Set(),
            lastSession: null
          };
        }
        
        menteeMap[menteeId].sessions.push(booking);
        menteeMap[menteeId].totalSessions++;
        menteeMap[menteeId].companies.add(booking.company_name);
        menteeMap[menteeId].interviewTypes.add(booking.interview_type);
        
        const sessionDate = new Date(`${booking.date}T${booking.start_time}`);
        if (!menteeMap[menteeId].lastSession || sessionDate > new Date(menteeMap[menteeId].lastSession)) {
          menteeMap[menteeId].lastSession = booking.date;
        }
      });
      
      // Convert to array and sort by last session date
      const menteesArray = Object.values(menteeMap).map(mentee => ({
        ...mentee,
        companies: Array.from(mentee.companies),
        interviewTypes: Array.from(mentee.interviewTypes)
      })).sort((a, b) => {
        if (!a.lastSession) return 1;
        if (!b.lastSession) return -1;
        return new Date(b.lastSession) - new Date(a.lastSession);
      });
      
      setMenteesData(menteesArray);
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Failed to load mentees data');
    } finally {
      setLoading(false);
    }
  };

  const MenteeCard = ({ mentee }) => (
    <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border hover:border-cyan-500/50 transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className={`${theme.text.primary} text-lg`}>{mentee.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3 h-3 text-gray-500" />
                <span className={`${theme.text.muted} text-sm`}>{mentee.email}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {mentee.totalSessions} session{mentee.totalSessions !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Last Session */}
        {mentee.lastSession && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`${theme.text.secondary} text-sm`}>
              Last session: {new Date(mentee.lastSession).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Companies */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className={`${theme.text.secondary} text-sm`}>Companies practiced:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mentee.companies.map(company => (
              <Badge key={company} variant="outline" className="text-xs">
                {company}
              </Badge>
            ))}
          </div>
        </div>

        {/* Interview Types */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span className={`${theme.text.secondary} text-sm`}>Interview types:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mentee.interviewTypes.map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {type.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className={`${theme.text.secondary} text-sm font-medium`}>Recent sessions:</span>
          </div>
          <div className="space-y-1">
            {mentee.sessions.slice(0, 3).map((session, idx) => (
              <div key={idx} className="text-xs text-gray-400 flex items-center justify-between">
                <span>{session.company_name} - {session.interview_type.replace('_', ' ')}</span>
                <span>{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
            {mentee.sessions.length > 3 && (
              <p className="text-xs text-gray-500">+ {mentee.sessions.length - 3} more session(s)</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="My Mentees">
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{menteesData.length}</p>
                  <p className={`${theme.text.secondary} text-sm`}>Total Mentees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {menteesData.reduce((sum, m) => sum + m.totalSessions, 0)}
                  </p>
                  <p className={`${theme.text.secondary} text-sm`}>Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {menteesData.length > 0 
                      ? (menteesData.reduce((sum, m) => sum + m.totalSessions, 0) / menteesData.length).toFixed(1)
                      : '0'}
                  </p>
                  <p className={`${theme.text.secondary} text-sm`}>Avg Sessions/Mentee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentees List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className={theme.text.muted}>Loading mentees...</p>
          </div>
        ) : menteesData.length === 0 ? (
          <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className={theme.text.muted}>No mentees yet</p>
              <p className="text-sm text-gray-600 mt-2">
                Mentees will appear here after you complete sessions with them
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menteesData.map(mentee => (
              <MenteeCard key={mentee.id} mentee={mentee} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorMentees;
