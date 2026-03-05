import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  UserPlus,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Settings,
  FileText,
  Award,
  Target,
  Zap
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentees: 0,
    totalMentors: 0,
    paidUsers: 0,
    freeUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSlots: 0,
    availableSlots: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const [menteesRes, mentorsRes] = await Promise.all([
        api.get('/admin/mentees'),
        api.get('/admin/mentors')
      ]);
      
      const mentees = menteesRes.data;
      const mentors = mentorsRes.data;
      
      const paidMentees = mentees.filter(m => m.status === 'Active' && m.plan_id).length;
      const freeMentees = mentees.filter(m => m.status === 'Free' || !m.plan_id).length;
      
      // Fetch sessions
      const sessionsRes = await api.get('/admin/sessions');
      const sessions = sessionsRes.data;
      
      const pending = sessions.filter(s => s.status === 'pending').length;
      const completed = sessions.filter(s => s.status === 'completed').length;
      
      // Calculate revenue (₹800 per session)
      const totalRevenue = completed * 800;
      
      setStats({
        totalUsers: mentees.length + mentors.length,
        totalMentees: mentees.length,
        totalMentors: mentors.length,
        paidUsers: paidMentees,
        freeUsers: freeMentees,
        totalBookings: sessions.length,
        pendingBookings: pending,
        completedBookings: completed,
        totalRevenue,
        monthlyRevenue: totalRevenue, // TODO: Calculate monthly
        totalSlots: 0, // TODO: Fetch from slots endpoint
        availableSlots: 0
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
          <span>Manage</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
              Admin Dashboard
            </h1>
            <p className={theme.text.secondary}>
              Platform overview and management
            </p>
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-1">{stats.totalUsers}</p>
            <p className={`${theme.text.secondary} text-sm`}>Total Users</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-green-400">{stats.totalMentees} mentees</span>
              <span className={theme.text.muted}>•</span>
              <span className="text-purple-400">{stats.totalMentors} mentors</span>
            </div>
          </div>

          {/* Paid Users */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30">
                Active
              </Badge>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-1">{stats.paidUsers}</p>
            <p className={`${theme.text.secondary} text-sm`}>Paid Subscribers</p>
            <p className={`${theme.text.muted} text-xs mt-3`}>
              {stats.freeUsers} free users
            </p>
          </div>

          {/* Total Bookings */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              {stats.pendingBookings > 0 && (
                <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  {stats.pendingBookings} pending
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-1">{stats.totalBookings}</p>
            <p className={`${theme.text.secondary} text-sm`}>Total Bookings</p>
            <p className={`${theme.text.muted} text-xs mt-3`}>
              {stats.completedBookings} completed
            </p>
          </div>

          {/* Revenue */}
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400 mb-1">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className={`${theme.text.secondary} text-sm`}>Total Revenue</p>
            <p className={`${theme.text.muted} text-xs mt-3`}>
              ₹{stats.monthlyRevenue.toLocaleString('en-IN')} this month
            </p>
          </div>
        </div>

        {/* Platform Health */}
        <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
          <h2 className={`${theme.text.primary} text-xl font-bold mb-6`}>Platform Health</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Growth */}
            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Conversion Rate</p>
                  <p className={`${theme.text.muted} text-xs`}>Free to Paid</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {stats.totalMentees > 0 
                  ? Math.round((stats.paidUsers / stats.totalMentees) * 100)
                  : 0}%
              </p>
            </div>

            {/* Booking Rate */}
            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Completion Rate</p>
                  <p className={`${theme.text.muted} text-xs`}>Bookings completed</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {stats.totalBookings > 0 
                  ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                  : 0}%
              </p>
            </div>

            {/* Platform Activity */}
            <div className={`${theme.bg.secondary} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Active Mentors</p>
                  <p className={`${theme.text.muted} text-xs`}>With available slots</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.totalMentors}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="User Management"
              description="Manage mentees, mentors, and user accounts"
              icon={Users}
              to="/admin/mentees"
              color="from-blue-400 to-cyan-500"
              badge={`${stats.totalUsers} users`}
            />
            
            <QuickActionCard
              title="Session Monitor"
              description="View and manage all interview sessions"
              icon={Calendar}
              to="/admin/sessions"
              color="from-purple-400 to-pink-500"
              badge={stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : null}
            />
            
            <QuickActionCard
              title="Revenue Tracking"
              description="Track revenue, payouts, and financial metrics"
              icon={DollarSign}
              to="/admin/revenue"
              color="from-emerald-400 to-teal-500"
              badge={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            />
            
            <QuickActionCard
              title="Mentor Analytics"
              description="View mentor performance and utilization"
              icon={BarChart3}
              to="/admin/mentor-analytics"
              color="from-orange-400 to-red-500"
              badge={`${stats.totalMentors} mentors`}
            />
            
            <QuickActionCard
              title="Booking Analytics"
              description="Analyze booking patterns and trends"
              icon={Target}
              to="/admin/booking-analytics"
              color="from-cyan-400 to-blue-500"
              badge={`${stats.totalBookings} bookings`}
            />
            
            <QuickActionCard
              title="Pricing Management"
              description="Manage pricing plans and features"
              icon={Settings}
              to="/admin/pricing"
              color="from-pink-400 to-rose-500"
            />
            
            <QuickActionCard
              title="Companies"
              description="Manage company listings and details"
              icon={Building2}
              to="/admin/companies"
              color="from-indigo-400 to-purple-500"
            />
            
            <QuickActionCard
              title="Payouts"
              description="Manage mentor payouts and payments"
              icon={Award}
              to="/admin/payouts"
              color="from-yellow-400 to-orange-500"
            />
            
            <QuickActionCard
              title="Reports"
              description="Generate and view platform reports"
              icon={FileText}
              to="/admin/reports"
              color="from-teal-400 to-cyan-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${theme.text.primary} text-xl font-bold`}>Recent Activity</h2>
            <Link to="/admin/sessions">
              <Button variant="outline" className={theme.button.secondary}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {stats.pendingBookings > 0 && (
              <div className="flex items-center gap-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className={`${theme.text.primary} font-semibold`}>
                    {stats.pendingBookings} Pending Booking{stats.pendingBookings !== 1 ? 's' : ''}
                  </p>
                  <p className={`${theme.text.secondary} text-sm`}>
                    Awaiting mentor assignment
                  </p>
                </div>
                <Link to="/admin/sessions">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    Review
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4 p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
              <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className={`${theme.text.primary} font-semibold`}>
                  {stats.completedBookings} Completed Sessions
                </p>
                <p className={`${theme.text.secondary} text-sm`}>
                  Total interviews conducted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-400/10 border border-blue-400/30 rounded-lg">
              <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className={`${theme.text.primary} font-semibold`}>
                  {stats.paidUsers} Active Subscribers
                </p>
                <p className={`${theme.text.secondary} text-sm`}>
                  Paid plan users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
