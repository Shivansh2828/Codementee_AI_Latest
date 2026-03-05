import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
  BarChart3,
  Bug
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

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
      const upcoming = bookings.upcoming?.length || 0;
      
      // Calculate earnings (₹800 per session)
      const totalEarnings = completed * 800;
      const pendingPayout = booked * 800;
      
      setStats({
        totalSlots: slots.length,
        availableSlots: available,
        bookedSlots: booked,
        completedSessions: completed,
        upcomingBookings: upcoming,
        averageRating: 4.8, // TODO: Calculate from feedbacks
        totalEarnings,
        pendingPayout
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

        {/* Quick Actions */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Create Slot"
              description="Add new availability slots for mentees to book"
              icon={Plus}
              to="/mentor/slots"
              color="from-blue-400 to-cyan-500"
              badge={`${stats.availableSlots} available`}
            />
            
            <QuickActionCard
              title="My Bookings"
              description="View and manage your upcoming interview sessions"
              icon={BookOpen}
              to="/mentor/bookings"
              color="from-purple-400 to-pink-500"
              badge={stats.upcomingBookings > 0 ? `${stats.upcomingBookings} upcoming` : null}
            />
            
            <QuickActionCard
              title="Manage Slots"
              description="Edit or delete your existing availability slots"
              icon={Calendar}
              to="/mentor/slots"
              color="from-green-400 to-emerald-500"
              badge={`${stats.totalSlots} total`}
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
              title="Performance"
              description="View detailed analytics and feedback ratings"
              icon={BarChart3}
              to="/mentor/analytics"
              color="from-orange-400 to-red-500"
              badge={`${stats.averageRating.toFixed(1)} ★`}
            />
            
            <QuickActionCard
              title="Help & Support"
              description="Get help with mentoring or technical issues"
              icon={Users}
              to="/mentor/support"
              color="from-cyan-400 to-blue-500"
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
    </DashboardLayout>
  );
};

export default MentorDashboard;
