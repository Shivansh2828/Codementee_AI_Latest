import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, User, Building2, MessageSquare, ArrowRight, AlertCircle, RefreshCw, ExternalLink, Mail } from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const MenteeMentorSelection = () => {
  const { theme } = useTheme();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      // Fetch bookings from the new endpoint
      const response = await api.get('/mentee/bookings');
      setUpcomingBookings(response.data.upcoming || []);
      setPastBookings(response.data.past || []);
      
      if (showRefreshing) {
        toast.success('Status updated!');
      }
    } catch (error) {
      toast.error('Failed to fetch booking data');
      console.error('Fetch booking data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return `${theme.bg.card} text-yellow-400 border-yellow-500/30`;
      case 'confirmed': return `${theme.bg.card} text-green-400 border-green-500/30`;
      case 'cancelled': return `${theme.bg.card} text-red-400 border-red-500/30`;
      default: return `${theme.bg.card} ${theme.text.muted} ${theme.border.primary}`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  if (loading) {
    return (
      <DashboardLayout title="Your Mock Interviews">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your interviews...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Your Mock Interviews">
      <div className="space-y-8">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Your Mock Interviews</h1>
            <p className={theme.text.secondary}>Track your interview requests and scheduled sessions</p>
          </div>
          <button
            onClick={() => fetchBookingData(true)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme.button.secondary} transition-all`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#06b6d4]" />
              <span className={`font-semibold ${theme.text.primary}`}>Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-[#06b6d4]">{upcomingBookings.length}</p>
            <p className={`text-sm ${theme.text.muted}`}>Scheduled interviews</p>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className={`font-semibold ${theme.text.primary}`}>Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{pastBookings.length}</p>
            <p className={`text-sm ${theme.text.muted}`}>Past interviews</p>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className={`font-semibold ${theme.text.primary}`}>Total</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{upcomingBookings.length + pastBookings.length}</p>
            <p className={`text-sm ${theme.text.muted}`}>All interviews</p>
          </div>
        </div>

        {/* Info Card */}
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.accent} border`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`${theme.text.accent} font-semibold mb-2`}>Instant Booking Confirmation</h3>
              <p className={`${theme.text.secondary} mb-3`}>
                When you book a slot, it's instantly confirmed! Mentors have already made these slots available, 
                so there's no waiting for approval. Here's what happens:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold text-xs">1</span>
                  </div>
                  <span className={theme.text.secondary}>Select & book slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold text-xs">2</span>
                  </div>
                  <span className={theme.text.secondary}>Instantly confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold text-xs">3</span>
                  </div>
                  <span className={theme.text.secondary}>Email with details sent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <div className={`${theme.glass} rounded-2xl p-12 text-center ${theme.border.primary} border`}>
            <div className="w-20 h-20 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-semibold ${theme.text.primary} mb-3`}>Ready to start practicing?</h3>
            <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
              Book your first mock interview with our expert mentors from top companies. Slots are instantly confirmed!
            </p>
            <Link to="/mentee/slots">
              <button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-8 py-3 rounded-xl font-medium hover:from-[#0891b2] hover:to-[#0e7490] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Calendar className="w-5 h-5 mr-2 inline" />
                Schedule Your First Mock Interview
              </button>
            </Link>
          </div>
        )}

        {/* Upcoming Interviews */}
        {upcomingBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Upcoming Interviews</h2>
              <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30">
                {upcomingBookings.length} Scheduled
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border ${theme.shadow}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${theme.text.primary}`}>{booking.company_name}</h3>
                        <p className={`${theme.text.secondary} text-sm`}>
                          {booking.interview_track?.toUpperCase()} • {booking.interview_type?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-3 flex items-center gap-2`}>
                        <Calendar className="w-4 h-4 text-[#06b6d4]" />
                        Interview Schedule
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`${theme.text.secondary} text-sm`}>
                            {formatDate(booking.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-green-400" />
                          <span className={`${theme.text.secondary} text-sm font-medium`}>
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-3 flex items-center gap-2`}>
                        <User className="w-4 h-4 text-purple-400" />
                        Mentor Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`${theme.text.muted} text-sm`}>Name:</span>
                          <span className={`${theme.text.secondary} text-sm font-medium`}>
                            {booking.mentor_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme.text.muted} text-sm`}>Email:</span>
                          <span className={`${theme.text.secondary} text-sm font-medium`}>
                            {booking.mentor_email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.specific_topics && booking.specific_topics.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`${theme.text.primary} font-medium text-sm mb-2`}>Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.specific_topics.map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-400/20 text-blue-400 border border-blue-400/30 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.meeting_link && (
                    <div className={`pt-4 border-t ${theme.border.primary}`}>
                      <a 
                        href={booking.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-6 py-3 rounded-xl font-medium hover:from-[#0891b2] hover:to-[#0e7490] transition-all shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Interview
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Interviews */}
        {pastBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Past Interviews</h2>
              <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30">
                {pastBookings.length} Completed
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border opacity-75`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className={`${theme.text.primary} font-medium`}>{booking.company_name}</h3>
                        <p className={`${theme.text.muted} text-sm`}>
                          {formatDate(booking.date)} at {formatTime(booking.start_time)}
                        </p>
                      </div>
                    </div>
                    {booking.feedback_submitted ? (
                      <Link to="/mentee/feedbacks">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Feedback
                        </Button>
                      </Link>
                    ) : (
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        Feedback Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Link to="/mentee/slots">
            <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Another Interview
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenteeMentorSelection;