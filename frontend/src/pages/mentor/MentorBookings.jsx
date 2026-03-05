import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Briefcase, 
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const MentorBookings = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/mentor/bookings');
      setBookings(response.data || { upcoming: [], past: [] });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const BookingCard = ({ booking, isPast }) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);

    return (
      <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className={`font-semibold ${theme.text.primary}`}>
                  {new Date(booking.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className={theme.text.muted}>
                  {booking.start_time} - {booking.end_time}
                </span>
              </div>
            </div>
            <div>
              <Badge 
                variant="default" 
                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Mentee Information */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Mentee Information</span>
            </div>
            <div className="space-y-1">
              <p className={`text-sm ${theme.text.primary}`}>
                <span className="text-gray-500">Name:</span> {booking.mentee_name}
              </p>
              <p className={`text-sm ${theme.text.primary}`}>
                <span className="text-gray-500">Email:</span> {booking.mentee_email}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Company</span>
            </div>
            <p className={`text-sm ${theme.text.primary}`}>{booking.company_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Interview Type</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {booking.interview_type?.replace('_', ' ')}
              </Badge>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Experience Level</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {booking.experience_level}
              </Badge>
            </div>
          </div>

          {/* Interview Track */}
          {booking.interview_track && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Interview Track</span>
              </div>
              <p className={`text-sm ${theme.text.primary}`}>{booking.interview_track}</p>
            </div>
          )}

          {/* Specific Topics */}
          {booking.specific_topics && booking.specific_topics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Specific Topics</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {booking.specific_topics.map((topic, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {booking.additional_notes && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Additional Notes</span>
              </div>
              <p className={`text-sm ${theme.text.muted} italic`}>
                "{booking.additional_notes}"
              </p>
            </div>
          )}

          {/* Meeting Link */}
          {booking.meeting_link && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Meeting Link</span>
              </div>
              <a 
                href={booking.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline truncate block"
              >
                {booking.meeting_link}
              </a>
            </div>
          )}

          {/* Feedback Status (for past sessions) */}
          {isPast && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center gap-2">
                {booking.feedback_submitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Feedback Submitted</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Feedback Pending</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions for upcoming sessions */}
          {!isPast && booking.meeting_link && (
            <div className="pt-2 border-t border-gray-700">
              <Button
                size="sm"
                className="w-full bg-cyan-500 hover:bg-cyan-600"
                onClick={() => window.open(booking.meeting_link, '_blank')}
              >
                <Video className="w-3 h-3 mr-2" />
                Join Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-6">
        <p className={theme.text.muted}>
          View all your scheduled and past mock interview sessions
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className={theme.text.muted}>Loading bookings...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({bookings.upcoming?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({bookings.past?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {!bookings.upcoming || bookings.upcoming.length === 0 ? (
                <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className={theme.text.muted}>No upcoming bookings</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Your scheduled sessions will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.upcoming.map(booking => (
                    <BookingCard key={booking.id} booking={booking} isPast={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {!bookings.past || bookings.past.length === 0 ? (
                <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className={theme.text.muted}>No past bookings</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Your completed sessions will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.past.map(booking => (
                    <BookingCard key={booking.id} booking={booking} isPast={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorBookings;
