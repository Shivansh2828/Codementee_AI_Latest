import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Briefcase, 
  TrendingUp,
  ExternalLink,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Mail
} from "lucide-react";
import api from "../../utils/api";

const MenteeBookingsList = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await api.get('/mentee/bookings');
      setBookings(response.data);
      
      if (showRefreshing) {
        toast.success('Bookings refreshed!');
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelClick = (booking) => {
    // Check 24-hour policy
    const sessionDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      toast.error('Cannot cancel booking', {
        description: `Bookings can only be cancelled more than 24 hours in advance. Your session is in ${Math.round(hoursUntilSession)} hours.`
      });
      return;
    }

    setCancellingBooking(booking);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingBooking) return;

    try {
      await api.delete(`/mentee/bookings/${cancellingBooking.id}`);
      
      toast.success('Booking cancelled', {
        description: 'Your interview quota has been restored.'
      });
      
      setShowCancelDialog(false);
      setCancellingBooking(null);
      fetchBookings(true);
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.code === 'CANCELLATION_POLICY_VIOLATION') {
        toast.error('Cannot cancel', {
          description: errorData.message
        });
      } else {
        toast.error('Cancellation failed', {
          description: errorData?.message || 'An error occurred while cancelling the booking.'
        });
      }
      
      console.error('Cancel booking error:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const canCancelBooking = (booking) => {
    const sessionDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
    return hoursUntilSession >= 24;
  };

  if (loading) {
    return (
      <div className={`text-center py-12 ${theme.text.secondary}`}>
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  const totalBookings = bookings.upcoming.length + bookings.past.length;

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>My Bookings</h2>
          <p className={`${theme.text.secondary} text-sm mt-1`}>
            {totalBookings} total booking{totalBookings !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          variant="outline"
          className={`${theme.button.secondary} flex items-center gap-2`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border text-center`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#06b6d4]" />
            <span className={`font-semibold ${theme.text.primary}`}>Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-[#06b6d4]">{bookings.upcoming.length}</p>
          <p className={`text-sm ${theme.text.muted}`}>Scheduled sessions</p>
        </div>
        
        <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border text-center`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className={`font-semibold ${theme.text.primary}`}>Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{bookings.past.length}</p>
          <p className={`text-sm ${theme.text.muted}`}>Past sessions</p>
        </div>
      </div>

      {/* Empty State */}
      {totalBookings === 0 && (
        <div className={`${theme.glass} rounded-2xl p-12 text-center ${theme.border.primary} border`}>
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${theme.text.primary} mb-3`}>No bookings yet</h3>
          <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
            Browse available slots and book your first mock interview to get started.
          </p>
        </div>
      )}

      {/* Upcoming Bookings */}
      {bookings.upcoming.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
            <Calendar className="w-5 h-5 text-[#06b6d4]" />
            Upcoming Sessions
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {bookings.upcoming.map((booking) => (
              <Card 
                key={booking.id} 
                className={`${theme.glass} ${theme.border.primary} border ${theme.shadow}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`${theme.text.primary} text-lg`}>
                          {booking.company_name}
                        </CardTitle>
                        <p className={`${theme.text.secondary} text-sm`}>
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30">
                      Confirmed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-3 flex items-center gap-2`}>
                        <Clock className="w-4 h-4 text-green-400" />
                        Session Time
                      </h4>
                      <p className={`${theme.text.secondary} text-sm`}>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>

                    <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-3 flex items-center gap-2`}>
                        <User className="w-4 h-4 text-purple-400" />
                        Mentor
                      </h4>
                      <p className={`${theme.text.secondary} text-sm font-medium`}>
                        {booking.mentor_name}
                      </p>
                      <p className={`${theme.text.muted} text-xs`}>
                        {booking.mentor_email}
                      </p>
                    </div>
                  </div>

                  {/* Interview Details */}
                  <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                    <h4 className={`${theme.text.primary} font-medium text-sm mb-3 flex items-center gap-2`}>
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      Interview Details
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                        {booking.interview_type.replace('_', ' ')}
                      </Badge>
                      <Badge className="bg-teal-400/20 text-teal-400 border-teal-400/30 text-xs">
                        {booking.experience_level}
                      </Badge>
                      {booking.interview_track && booking.interview_track !== 'general' && (
                        <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 text-xs">
                          {booking.interview_track.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    {booking.specific_topics && booking.specific_topics.length > 0 && (
                      <div className="mt-2">
                        <p className={`${theme.text.muted} text-xs mb-1`}>Focus Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.specific_topics.map((topic, index) => (
                            <span 
                              key={index}
                              className={`${theme.bg.card} ${theme.text.secondary} text-xs px-2 py-1 rounded`}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  {booking.additional_notes && (
                    <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-2 flex items-center gap-2`}>
                        <MessageSquare className="w-4 h-4 text-orange-400" />
                        Your Notes
                      </h4>
                      <p className={`${theme.text.secondary} text-sm`}>
                        {booking.additional_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    {booking.meeting_link && (
                      <a
                        href={booking.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490]">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                      </a>
                    )}
                    {canCancelBooking(booking) && (
                      <Button
                        onClick={() => handleCancelClick(booking)}
                        variant="outline"
                        className={`${theme.button.secondary} flex items-center gap-2`}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Cancellation Policy Notice */}
                  {!canCancelBooking(booking) && (
                    <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        This booking cannot be cancelled (less than 24 hours until session)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {bookings.past.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
            <CheckCircle className="w-5 h-5 text-green-400" />
            Past Sessions
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {bookings.past.map((booking) => (
              <Card 
                key={booking.id} 
                className={`${theme.glass} ${theme.border.primary} border opacity-75`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`${theme.text.primary} text-lg`}>
                          {booking.company_name}
                        </CardTitle>
                        <p className={`${theme.text.secondary} text-sm`}>
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                        Completed
                      </Badge>
                      {booking.feedback_submitted ? (
                        <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Feedback Submitted
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Feedback Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`${theme.text.muted} text-xs mb-1`}>Mentor</p>
                      <p className={`${theme.text.secondary} text-sm font-medium`}>
                        {booking.mentor_name}
                      </p>
                    </div>
                    <div>
                      <p className={`${theme.text.muted} text-xs mb-1`}>Interview Type</p>
                      <p className={`${theme.text.secondary} text-sm`}>
                        {booking.interview_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className={`${theme.text.muted} text-xs mb-1`}>Time</p>
                      <p className={`${theme.text.secondary} text-sm`}>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>
                  </div>

                  {!booking.feedback_submitted && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Button
                        onClick={() => window.location.href = `/mentee/feedbacks?booking=${booking.id}`}
                        variant="outline"
                        className={`${theme.button.secondary} flex items-center gap-2`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Submit Feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className={`${theme.bg.card} ${theme.border.primary} border`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={theme.text.primary}>
              Cancel Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className={theme.text.secondary}>
              Are you sure you want to cancel this booking? Your interview quota will be restored.
              {cancellingBooking && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-white font-medium mb-1">
                    {cancellingBooking.company_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(cancellingBooking.date)} at {formatTime(cancellingBooking.start_time)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={theme.button.secondary}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenteeBookingsList;
