import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Plus,
  ArrowRight,
  RefreshCw,
  Award,
  Target,
  BookOpen,
  Bug,
  Video,
  AlertCircle,
  MessageSquare,
  Edit
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

const MentorDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    completedSessions: 0,
    upcomingBookings: 0,
    averageRating: 0,
    totalEarnings: 0,
    pendingPayout: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [feedbackDialog, setFeedbackDialog] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    technical_skills: '',
    communication: '',
    problem_solving: '',
    areas_of_improvement: '',
    overall_feedback: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch slots
      const slotsRes = await api.get('/mentor/slots');
      const slots = slotsRes.data;
      
      const available = slots.filter(s => s.status === 'available').length;
      const booked = slots.filter(s => s.status === 'booked').length;
      const completed = slots.filter(s => s.status === 'completed').length;
      
      // Fetch bookings
      const bookingsRes = await api.get('/mentor/bookings');
      const bookings = bookingsRes.data;
      const upcoming = bookingsRes.data.upcoming || [];
      
      // Get today's sessions
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = upcoming.filter(b => b.date === today);
      
      // Sort upcoming by date/time
      const sortedUpcoming = upcoming
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start_time}`);
          const dateB = new Date(`${b.date}T${b.start_time}`);
          return dateA - dateB;
        })
        .slice(0, 3);
      
      // Fetch recent feedbacks
      const feedbacksRes = await api.get('/mentor/feedbacks');
      const recentFeedback = (feedbacksRes.data || []).slice(0, 5);
      
      // Calculate average rating from feedbacks
      const avgRating = recentFeedback.length > 0
        ? recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length
        : 0;
      
      // Calculate earnings (₹800 per session)
      const totalEarnings = completed * 800;
      const pendingPayout = booked * 800;
      
      setStats({
        totalSlots: slots.length,
        availableSlots: available,
        bookedSlots: booked,
        completedSessions: completed,
        upcomingBookings: upcoming.length,
        averageRating: avgRating,
        totalEarnings,
        pendingPayout
      });
      
      setUpcomingSessions(sortedUpcoming);
      setTodaySessions(todayBookings);
      setRecentFeedbacks(recentFeedback);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = (booking) => {
    setFeedbackDialog(booking);
    setFeedbackForm({
      rating: 5,
      technical_skills: '',
      communication: '',
      problem_solving: '',
      areas_of_improvement: '',
      overall_feedback: ''
    });
  };

  const handleEditFeedback = async (feedback) => {
    setFeedbackDialog({ ...feedback, isEdit: true });
    setFeedbackForm({
      rating: feedback.rating || 5,
      technical_skills: feedback.technical_skills || '',
      communication: feedback.communication || '',
      problem_solving: feedback.problem_solving || '',
      areas_of_improvement: feedback.areas_of_improvement || '',
      overall_feedback: feedback.overall_feedback || ''
    });
  };

  const handleSubmitFeedback = async () => {
    try {
      const formData = new FormData();
      formData.append('rating', feedbackForm.rating);
      formData.append('technical_skills', feedbackForm.technical_skills);
      formData.append('communication', feedbackForm.communication);
      formData.append('problem_solving', feedbackForm.problem_solving);
      formData.append('areas_of_improvement', feedbackForm.areas_of_improvement);
      formData.append('overall_feedback', feedbackForm.overall_feedback);
      
      if (feedbackDialog.isEdit) {
        // Update existing feedback
        await api.put(`/mentor/feedbacks/${feedbackDialog.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Feedback updated successfully');
      } else {
        // Create new feedback
        formData.append('booking_id', feedbackDialog.id);
        formData.append('mentee_id', feedbackDialog.mentee_id);
        formData.append('mentee_name', feedbackDialog.mentee_name);
        
        await api.post('/mentor/feedbacks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Feedback submitted successfully');
      }
      setFeedbackDialog(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getTimeUntil = (date, time) => {
    const sessionDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = sessionDate - now;
    
    if (diff < 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes}m`;
    const days = Math.floor(hours / 24);
    return `in ${days}d`;
  };

  const QuickActionCard = ({ title, description, icon: Icon, to, color, badge }) => (
    <Link to={to}>
      <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} transition-all hover:scale-105 hover:border-[#06b6d4]`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30 text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <h3 className={`${theme.text.primary} font-semibold mb-2`}>{title}</h3>
        <p className={`${theme.text.secondary} text-sm mb-4`}>{description}</p>
        <div className="flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
          <span>Open</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentor Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className={theme.text.secondary}>
            Here's your mentoring activity overview
          </p>
        </div>

        {/* Next Session Alert (if upcoming session exists) */}
        {upcomingSessions.length > 0 && (
          <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.accent} border-2 border-[#06b6d4]`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#06b6d4]/20 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-[#06b6d4]" />
                  </div>
                  <div>
                    <h3 className={`${theme.text.primary} text-lg font-bold`}>Next Session</h3>
                    <p className={`${theme.text.muted} text-sm`}>
                      {getTimeUntil(upcomingSessions[0].date, upcomingSessions[0].start_time)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`${theme.text.muted} text-xs mb-1`}>Mentee</p>
                    <p className={`${theme.text.primary} font-semibold`}>{upcomingSessions[0].mentee_name}</p>
                  </div>
                  <div>
                    <p className={`${theme.text.muted} text-xs mb-1`}>Company</p>
                    <p className={`${theme.text.primary} font-semibold`}>{upcomingSessions[0].company_name}</p>
                  </div>
                  <div>
                    <p className={`${theme.text.muted} text-xs mb-1`}>Date & Time</p>
                    <p className={`${theme.text.primary} font-semibold`}>
                      {upcomingSessions[0].date} at {upcomingSessions[0].start_time}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.muted} text-xs mb-1`}>Type</p>
                    <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                      {upcomingSessions[0].interview_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <a href={upcomingSessions[0].meeting_link} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className={theme.button.secondary}
                  onClick={() => handleAddFeedback(upcomingSessions[0])}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Feedback
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        {todaySessions.length > 0 && (
          <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
            <h2 className={`${theme.text.primary} text-xl font-bold mb-4`}>Today's Schedule</h2>
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className={`${theme.bg.secondary} rounded-xl p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className={`${theme.text.primary} font-semibold`}>{session.mentee_name}</p>
                      <p className={`${theme.text.muted} text-sm`}>
                        {session.start_time} - {session.end_time} • {session.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                      {session.interview_type}
                    </Badge>
                    <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
                        Join
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Slots */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-1">{stats.totalSlots}</p>
            <p className={`${theme.text.secondary} text-sm`}>Total Slots Created</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-green-400">{stats.availableSlots} available</span>
              <span className={theme.text.muted}>•</span>
              <span className="text-yellow-400">{stats.bookedSlots} booked</span>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              {stats.upcomingBookings > 0 && (
                <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-1">{stats.upcomingBookings}</p>
            <p className={`${theme.text.secondary} text-sm`}>Upcoming Sessions</p>
            <p className={`${theme.text.muted} text-xs mt-3`}>
              {stats.upcomingBookings === 0 ? 'No sessions scheduled' : 'Sessions this week'}
            </p>
          </div>

          {/* Completed Sessions */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-green-400 mb-1">{stats.completedSessions}</p>
            <p className={`${theme.text.secondary} text-sm`}>Completed Sessions</p>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400">{stats.averageRating.toFixed(1)}</span>
              <span className={theme.text.muted}>average rating</span>
            </div>
          </div>

          {/* Earnings */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30">
                ₹800/session
              </Badge>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-1">
              ₹{stats.totalEarnings.toLocaleString('en-IN')}
            </p>
            <p className={`${theme.text.secondary} text-sm`}>Total Earnings</p>
            <p className={`${theme.text.muted} text-xs mt-3`}>
              ₹{stats.pendingPayout.toLocaleString('en-IN')} pending
            </p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${theme.text.primary} text-xl font-bold mb-1`}>Performance Overview</h2>
              <p className={theme.text.secondary}>Your mentoring impact this month</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className={theme.button.secondary}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Utilization Rate</p>
                  <p className={`${theme.text.muted} text-xs`}>Booked vs Available</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {stats.totalSlots > 0 
                  ? Math.round((stats.bookedSlots / stats.totalSlots) * 100)
                  : 0}%
              </p>
            </div>

            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Mentees Helped</p>
                  <p className={`${theme.text.muted} text-xs`}>Total unique mentees</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-400">{stats.completedSessions}</p>
            </div>

            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Success Rate</p>
                  <p className={`${theme.text.muted} text-xs`}>Based on feedback</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.averageRating > 0 ? Math.round((stats.averageRating / 5) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Widget */}
        {upcomingSessions.length > 1 && (
          <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${theme.text.primary} text-xl font-bold`}>Upcoming Sessions</h2>
              <Link to="/mentor/bookings">
                <Button variant="outline" size="sm" className={theme.button.secondary}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingSessions.slice(1).map((session) => (
                <div key={session.id} className={`${theme.bg.secondary} rounded-xl p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`${theme.text.primary} font-semibold mb-1`}>{session.mentee_name}</p>
                      <p className={`${theme.text.muted} text-sm`}>{session.company_name}</p>
                    </div>
                    <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                      {getTimeUntil(session.date, session.start_time)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme.text.secondary}>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {session.date}
                      </span>
                      <span className={theme.text.secondary}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        {session.start_time}
                      </span>
                    </div>
                    <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                      {session.interview_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Feedbacks */}
        {recentFeedbacks.length > 0 && (
          <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${theme.text.primary} text-xl font-bold`}>Recent Feedback</h2>
              <Link to="/mentor/mentees">
                <Button variant="outline" size="sm" className={theme.button.secondary}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFeedbacks.slice(0, 4).map((feedback) => (
                <div key={feedback.id} className={`${theme.bg.secondary} rounded-xl p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`${theme.text.primary} font-semibold mb-1`}>{feedback.mentee_name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFeedback(feedback)}
                      className="text-[#06b6d4] hover:text-[#0891b2]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className={`${theme.text.muted} text-sm line-clamp-2`}>
                    {feedback.overall_feedback}
                  </p>
                  <p className={`${theme.text.muted} text-xs mt-2`}>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Manage Availability"
              description="Create and manage mock interview & resume review slots"
              icon={Plus}
              to="/mentor/slots"
              color="from-blue-400 to-cyan-500"
              badge={`${stats.availableSlots} available`}
            />
            
            <QuickActionCard
              title="My Bookings"
              description="View and manage your upcoming sessions"
              icon={BookOpen}
              to="/mentor/bookings"
              color="from-green-400 to-emerald-500"
              badge={stats.upcomingBookings > 0 ? `${stats.upcomingBookings} upcoming` : null}
            />
            
            <QuickActionCard
              title="Earnings & Payouts"
              description="Track your earnings and payout history"
              icon={DollarSign}
              to="/mentor/payouts"
              color="from-emerald-400 to-teal-500"
              badge={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
            />
            
            <QuickActionCard
              title="My Sessions"
              description="View completed and upcoming mock interviews"
              icon={Calendar}
              to="/mentor/mocks"
              color="from-cyan-400 to-blue-500"
              badge={`${stats.completedSessions} completed`}
            />
            
            <QuickActionCard
              title="My Mentees"
              description="View all mentees you've helped"
              icon={Users}
              to="/mentor/mentees"
              color="from-purple-400 to-pink-500"
            />
            
            <QuickActionCard
              title="Help & Support"
              description="Get help with mentoring or technical issues"
              icon={Bug}
              to="/mentor/bug-reports"
              color="from-orange-400 to-red-500"
            />
          </div>
        </div>

        {/* Call to Action */}
        {stats.availableSlots === 0 && (
          <div className={`${theme.glass} rounded-2xl p-8 text-center ${theme.border.accent} border-2`}>
            <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className={`${theme.text.primary} text-2xl font-bold mb-3`}>
              Create Your First Slot
            </h3>
            <p className={`${theme.text.secondary} mb-6 max-w-2xl mx-auto`}>
              Start helping mentees by creating availability slots. Set your schedule, 
              add your Google Meet link, and let mentees book time with you.
            </p>
            <Link to="/mentor/slots">
              <Button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-8 py-3 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Availability Slot
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Feedback Dialog */}
      {feedbackDialog && (
        <Dialog open={!!feedbackDialog} onOpenChange={() => setFeedbackDialog(null)}>
          <DialogContent className={`${theme.glass} ${theme.border.primary} border max-w-2xl`}>
            <DialogHeader>
              <DialogTitle className={theme.text.primary}>
                {feedbackDialog.isEdit ? 'Edit Feedback' : 'Add Feedback'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Mentee Info */}
              <div className={`${theme.bg.secondary} rounded-lg p-4`}>
                <p className={`${theme.text.muted} text-sm mb-1`}>Mentee</p>
                <p className={`${theme.text.primary} font-semibold`}>
                  {feedbackDialog.mentee_name}
                </p>
                {!feedbackDialog.isEdit && (
                  <>
                    <p className={`${theme.text.muted} text-sm mt-2 mb-1`}>Company</p>
                    <p className={`${theme.text.primary} font-semibold`}>
                      {feedbackDialog.company_name}
                    </p>
                  </>
                )}
              </div>

              {/* Rating */}
              <div>
                <Label className={theme.text.primary}>Overall Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          rating <= feedbackForm.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className={`${theme.text.secondary} ml-2`}>
                    {feedbackForm.rating}/5
                  </span>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <Label className={theme.text.primary}>Technical Skills</Label>
                <Textarea
                  value={feedbackForm.technical_skills}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, technical_skills: e.target.value })}
                  placeholder="Assess coding ability, problem-solving approach, data structures knowledge..."
                  className={`${theme.input} mt-2`}
                  rows={3}
                />
              </div>

              {/* Communication */}
              <div>
                <Label className={theme.text.primary}>Communication</Label>
                <Textarea
                  value={feedbackForm.communication}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, communication: e.target.value })}
                  placeholder="Evaluate clarity of thought, explanation skills, asking clarifying questions..."
                  className={`${theme.input} mt-2`}
                  rows={3}
                />
              </div>

              {/* Problem Solving */}
              <div>
                <Label className={theme.text.primary}>Problem Solving</Label>
                <Textarea
                  value={feedbackForm.problem_solving}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, problem_solving: e.target.value })}
                  placeholder="Analyze approach to problems, edge case handling, optimization thinking..."
                  className={`${theme.input} mt-2`}
                  rows={3}
                />
              </div>

              {/* Areas of Improvement */}
              <div>
                <Label className={theme.text.primary}>Areas of Improvement</Label>
                <Textarea
                  value={feedbackForm.areas_of_improvement}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, areas_of_improvement: e.target.value })}
                  placeholder="Specific areas where the mentee can improve..."
                  className={`${theme.input} mt-2`}
                  rows={3}
                />
              </div>

              {/* Overall Feedback */}
              <div>
                <Label className={theme.text.primary}>Overall Feedback</Label>
                <Textarea
                  value={feedbackForm.overall_feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, overall_feedback: e.target.value })}
                  placeholder="Summary of the session, key takeaways, and recommendations..."
                  className={`${theme.input} mt-2`}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setFeedbackDialog(null)}
                  className={theme.button.secondary}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                >
                  {feedbackDialog.isEdit ? 'Update Feedback' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default MentorDashboard;
