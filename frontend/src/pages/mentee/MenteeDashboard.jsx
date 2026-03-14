import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  FileText,
  MessageSquare,
  Users,
  Crown,
  Lock,
  ArrowRight,
  Target,
  Award,
  BookOpen,
  Code,
  Network,
  MessageCircle,
  Briefcase,
  Bug,
  Mail,
  Phone as PhoneIcon,
  Headphones,
  X,
  Send
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import SupportRequestModal from "../../components/SupportRequestModal";

const MenteeDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailQuery, setEmailQuery] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    quotaRemaining: 0,
    quotaTotal: 0,
    resumeReviewsUsed: 0,
    resumeReviewsTotal: 0
  });
  const [planFeatures, setPlanFeatures] = useState([]);

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  
  // Get plan display name - Simple tier names only
  const getPlanDisplayName = () => {
    if (isFreeUser) return 'Free Tier';
    const planId = user?.plan_id;
    if (planId === 'starter') return 'Starter Plan';
    if (planId === 'pro') return 'Pro Plan';
    if (planId === 'elite') return 'Elite Plan';
    return 'Free Tier';
  };
  
  const planName = getPlanDisplayName();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch bookings
      const bookingsRes = await api.get('/mentee/bookings');
      const bookings = bookingsRes.data;
      
      const upcoming = bookings.upcoming || [];
      const past = bookings.past || [];
      
      // Fetch resume requests to calculate used reviews
      let resumeReviewsUsed = 0;
      const resumeReviewsTotal = user?.plan_features?.resume_reviews || 0;
      
      if (resumeReviewsTotal > 0) {
        try {
          const resumeRes = await api.get('/mentee/resume-requests');
          const resumeRequests = resumeRes.data || [];
          // Count non-cancelled requests as used
          resumeReviewsUsed = resumeRequests.filter(r => r.status !== 'cancelled').length;
        } catch (error) {
          console.error('Failed to fetch resume requests:', error);
        }
      }
      
      setStats({
        totalBookings: upcoming.length + past.length,
        upcomingBookings: upcoming.length,
        completedBookings: past.length,
        quotaRemaining: user?.interview_quota_remaining ?? 0,
        quotaTotal: user?.interview_quota_total ?? 0,
        resumeReviewsUsed,
        resumeReviewsTotal
      });

      // Set plan features based on user's plan
      if (user?.plan_id) {
        const features = getPlanFeatures(user.plan_id);
        setPlanFeatures(features);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailQuery.trim()) {
      toast.error('Please enter your query');
      return;
    }

    setSendingEmail(true);
    try {
      await api.post('/support-requests', {
        title: `Email Query from ${user?.name}`,
        description: emailQuery,
        severity: 'medium',
        priority: 'medium',
        category: 'general',
        page: window.location.pathname,
        user_id: user?.id,
        user_name: user?.name,
        user_email: user?.email,
        user_role: user?.role
      });

      toast.success('Your query has been sent! We\'ll respond via email within 24 hours.');
      setEmailQuery('');
      setEmailModalOpen(false);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send query. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const getPlanFeatures = (planId) => {
    const featureMap = {
      'starter': [
        { name: 'Mock Interviews', value: '1 mock interview', available: true, icon: Calendar },
        { name: 'Resume Review', value: 'Email review', available: true, icon: FileText, description: 'Upload resume for written feedback via email' },
        { name: 'Offline Profile Creation', value: 'Not included', available: false, icon: Target },
        { name: 'Community Access', value: 'Not included', available: false, icon: Users },
        { name: 'Priority Support', value: 'Not included', available: false, icon: MessageSquare }
      ],
      'pro': [
        { name: 'Mock Interviews', value: '3 mock interviews', available: true, icon: Calendar },
        { name: 'Resume Review', value: '30-min call', available: true, icon: FileText, description: 'Live 1:1 call with MAANG engineer for resume review' },
        { name: 'Offline Profile Creation', value: 'Not included', available: false, icon: Target },
        { name: 'Strategy Call', value: '1 session', available: true, icon: MessageSquare },
        { name: 'Community Access', value: 'Full access', available: true, icon: Users }
      ],
      'elite': [
        { name: 'Mock Interviews', value: '6 mock interviews', available: true, icon: Calendar },
        { name: 'Resume Review', value: '30-min call', available: true, icon: FileText, description: 'Live 1:1 call with MAANG engineer for resume review' },
        { name: 'Offline Profile Creation', value: '1 session included', available: true, icon: Target },
        { name: 'Referral Guidance', value: 'Best effort', available: true, icon: Award },
        { name: 'Priority Support', value: 'WhatsApp', available: true, icon: MessageSquare },
        { name: 'Community Access', value: 'Full access', available: true, icon: Users }
      ]
    };

    return featureMap[planId] || [];
  };

  const QuickActionCard = ({ title, description, icon: Icon, to, locked, badge }) => {
    const isBookingCard = title === "Book Mock Interview";
    
    return (
      <Link to={locked ? '#' : to} className={locked ? 'cursor-not-allowed' : ''}>
        <div className={`relative ${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} transition-all hover:scale-105 ${locked ? 'opacity-60' : 'hover:border-[#06b6d4]'} ${isBookingCard && !locked ? 'overflow-hidden' : ''}`}>
          {/* Sparkle effect for Book Mock Interview card */}
          {isBookingCard && !locked && (
            <>
              <span className="absolute top-3 right-6 w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-sparkle"></span>
              <span className="absolute top-6 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }}></span>
              <span className="absolute bottom-4 left-8 w-1 h-1 bg-blue-400 rounded-full animate-sparkle" style={{ animationDelay: '0.6s' }}></span>
            </>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${locked ? 'bg-gray-600' : 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]'} flex items-center justify-center ${isBookingCard && !locked ? 'relative overflow-hidden' : ''}`}>
              {/* Shimmer effect for icon */}
              {isBookingCard && !locked && (
                <span className="absolute inset-0 w-full h-full">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
                </span>
              )}
              {locked ? <Lock className="w-6 h-6 text-gray-400" /> : <Icon className="w-6 h-6 text-white relative z-10" />}
            </div>
            {badge && (
              <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <h3 className={`${theme.text.primary} font-semibold mb-2`}>{title}</h3>
          <p className={`${theme.text.secondary} text-sm mb-4`}>{description}</p>
          {locked ? (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Crown className="w-4 h-4" />
              <span>Upgrade to unlock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </Link>
    );
  };

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
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className={theme.text.secondary}>
            Here's your interview preparation progress
          </p>
        </div>

        {/* Migration Warning - Show if quota fields are missing */}
        {!isFreeUser && (user?.interview_quota_total === undefined || user?.interview_quota_total === null) && (
          <div className={`${theme.bg.secondary} rounded-xl p-4 border-2 border-yellow-500/30`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`${theme.text.primary} font-semibold mb-1`}>System Update Required</p>
                <p className={`${theme.text.secondary} text-sm`}>
                  Your account needs to be updated to show quota information. Please contact support or refresh the page in a few minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Card - Simplified */}
        <div className={`${theme.glass} rounded-2xl p-6 ${theme.border.primary} border ${theme.shadow}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${isFreeUser ? 'bg-gray-600' : 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]'} flex items-center justify-center`}>
                {isFreeUser ? <Lock className="w-6 h-6 text-gray-400" /> : <Crown className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className={`${theme.text.primary} text-xl font-bold`}>Your Progress</h2>
                <p className={`${theme.text.secondary} text-sm`}>
                  {isFreeUser ? 'Upgrade to unlock all features' : `${planName} - Active`}
                </p>
              </div>
            </div>
            {isFreeUser && (
              <Link to="/mentee/book">
                <Button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            )}
          </div>

          {/* Usage Summary - Only for Paid Users */}
          {!isFreeUser && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mock Interviews Quota */}
              <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#06b6d4]" />
                  <span className={`${theme.text.secondary} text-sm font-medium`}>Mock Interviews</span>
                </div>
                <p className={`${theme.text.primary} text-2xl font-bold`}>
                  {stats.quotaRemaining} / {stats.quotaTotal}
                </p>
                <p className={`${theme.text.muted} text-xs mt-1`}>
                  {stats.quotaRemaining === 0 ? 'All used' : `${stats.quotaRemaining} remaining`}
                </p>
              </div>

              {/* Resume Reviews Quota */}
              <div className={`${theme.bg.secondary} rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className={`${theme.text.secondary} text-sm font-medium`}>Resume Reviews</span>
                  </div>
                </div>
                <p className={`${theme.text.primary} text-2xl font-bold mb-1`}>
                  {stats.resumeReviewsTotal >= 999 
                    ? '∞ Unlimited' 
                    : `${stats.resumeReviewsTotal - stats.resumeReviewsUsed} / ${stats.resumeReviewsTotal}`
                  }
                </p>
                <p className={`${theme.text.muted} text-xs mb-3`}>
                  {user?.plan_id === 'starter' && '📧 Email review - Upload resume for written feedback'}
                  {(user?.plan_id === 'pro' || user?.plan_id === 'elite') && '📞 30-min call with MAANG engineer'}
                </p>
                {(stats.resumeReviewsTotal > 0 && (stats.resumeReviewsUsed < stats.resumeReviewsTotal || stats.resumeReviewsTotal >= 999)) && (
                  <Link to="/mentee/resume-review" className="block">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium py-2 px-4">
                      {user?.plan_id === 'starter' ? '📧 Upload Resume' : '📞 Book Call'}
                    </Button>
                  </Link>
                )}
                {stats.resumeReviewsUsed >= stats.resumeReviewsTotal && stats.resumeReviewsTotal < 999 && stats.resumeReviewsTotal > 0 && (
                  <div className={`text-center py-2 px-3 rounded-md ${theme.bg.tertiary}`}>
                    <p className={`${theme.text.muted} text-xs`}>All reviews used</p>
                  </div>
                )}
              </div>

              {/* Offline Profile Creation */}
              <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className={`${theme.text.secondary} text-sm font-medium`}>Profile Creation</span>
                </div>
                <p className={`${theme.text.primary} text-2xl font-bold`}>
                  {user?.plan_features?.offline_profile_creation || 0}
                </p>
                <p className={`${theme.text.muted} text-xs mt-1`}>
                  {user?.plan_features?.offline_profile_creation > 0 ? 'Offline session' : 'Not included'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-1">{stats.upcomingBookings}</p>
            <p className={`${theme.text.secondary} text-sm`}>Upcoming Interviews</p>
          </div>

          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400 mb-1">{stats.completedBookings}</p>
            <p className={`${theme.text.secondary} text-sm`}>Completed Interviews</p>
          </div>

          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border text-center`}>
            <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-1">{stats.totalBookings}</p>
            <p className={`${theme.text.secondary} text-sm`}>Total Interviews</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              title="Book Mock Interview"
              description="Schedule a mock interview with expert mentors from top companies"
              icon={Calendar}
              to="/mentee/slots"
              locked={isFreeUser}
              badge={stats.quotaRemaining > 0 ? `${stats.quotaRemaining} left` : null}
            />
            
            <QuickActionCard
              title="Resume Review"
              description={user?.plan_id === 'starter' 
                ? "Get expert feedback on your resume via email"
                : "Book a 30-min call with a MAANG engineer for resume review"
              }
              icon={FileText}
              to="/mentee/resume-review"
              locked={isFreeUser}
              badge={stats.resumeReviewsTotal >= 999 ? '∞ Unlimited' : (stats.resumeReviewsTotal > 0 && stats.resumeReviewsUsed < stats.resumeReviewsTotal) ? `${stats.resumeReviewsTotal - stats.resumeReviewsUsed} left` : null}
            />
            
            <QuickActionCard
              title="My Interviews"
              description="View your upcoming and past interview sessions"
              icon={BookOpen}
              to="/mentee/mocks"
              locked={false}
            />
            
            <QuickActionCard
              title="Community Forum"
              description="Connect with other mentees and share interview experiences"
              icon={Users}
              to="/mentee/community"
              locked={!['pro', 'elite'].includes(user?.plan_id)}
            />
            
            <QuickActionCard
              title="My Feedbacks"
              description="Review detailed feedback from your completed interviews"
              icon={MessageSquare}
              to="/mentee/feedbacks"
              locked={false}
            />
          </div>
        </div>

        {/* Interview Types Section */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-3`}>Interview Types We Offer</h2>
          <p className={`${theme.text.secondary} mb-6`}>
            Choose from various interview formats to match your target role
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DSA/Coding */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all group cursor-pointer`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${theme.text.primary} font-bold mb-2`}>DSA & Coding</h3>
              <p className={`${theme.text.muted} text-sm mb-3`}>
                Data structures, algorithms, and problem-solving
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Arrays</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Trees</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">DP</Badge>
              </div>
            </div>

            {/* System Design */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all group cursor-pointer`}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${theme.text.primary} font-bold mb-2`}>System Design</h3>
              <p className={`${theme.text.muted} text-sm mb-3`}>
                Architecture, scalability, and distributed systems
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">HLD</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">LLD</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">Scale</Badge>
              </div>
            </div>

            {/* Behavioral */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all group cursor-pointer`}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${theme.text.primary} font-bold mb-2`}>Behavioral</h3>
              <p className={`${theme.text.muted} text-sm mb-3`}>
                Leadership, teamwork, and problem-solving scenarios
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">STAR</Badge>
                <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Stories</Badge>
              </div>
            </div>

            {/* HR Round */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all group cursor-pointer`}>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${theme.text.primary} font-bold mb-2`}>HR Round</h3>
              <p className={`${theme.text.muted} text-sm mb-3`}>
                Culture fit, salary negotiation, and company questions
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">Fit</Badge>
                <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">Salary</Badge>
              </div>
            </div>
          </div>
        </div>



        {/* Quick Contact / Support Section */}
        <div>
          <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Support Request */}
            <Card className={`${theme.glass} ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all cursor-pointer`}
              onClick={() => setSupportModalOpen(true)}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <h3 className={`${theme.text.primary} font-semibold mb-2`}>Contact Support</h3>
                <p className={`${theme.text.secondary} text-sm mb-4`}>
                  Submit a support request and we'll get back to you within 24 hours
                </p>
                <div className="flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
                  <span>Open Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className={`${theme.glass} ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all cursor-pointer`}
              onClick={() => {
                const phone = '919731842807';
                const message = encodeURIComponent('Hi Codementee Team! I need help with...');
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
              }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <PhoneIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`${theme.text.primary} font-semibold mb-2`}>WhatsApp Chat</h3>
                <p className={`${theme.text.secondary} text-sm mb-4`}>
                  Quick response for urgent queries via WhatsApp
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <span>Chat Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card 
              className={`${theme.glass} ${theme.border.primary} border ${theme.shadow} hover:scale-105 transition-all cursor-pointer`}
              onClick={() => setEmailModalOpen(true)}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className={`${theme.text.primary} font-semibold mb-2`}>Email Support</h3>
                <p className={`${theme.text.secondary} text-sm mb-4`}>
                  Send us an email at support@codementee.com
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                  <span>Compose Email</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Request Modal */}
        <SupportRequestModal 
          isOpen={supportModalOpen} 
          onClose={() => setSupportModalOpen(false)} 
        />

        {/* Email Query Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border max-w-lg w-full ${theme.shadow}`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${theme.border.primary}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme.text.primary}`}>Email Support</h2>
                    <p className={`text-sm ${theme.text.secondary}`}>We'll respond within 24 hours</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className={`${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Your Query *
                  </label>
                  <textarea
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    placeholder="Please describe your question or issue in detail..."
                    required
                    rows={8}
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                  />
                  <p className={`${theme.text.muted} text-xs mt-2`}>
                    Your details (Name: {user?.name}, Email: {user?.email}) will be automatically included
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    variant="secondary"
                    className="flex-1"
                    disabled={sendingEmail}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    disabled={sendingEmail || !emailQuery.trim()}
                  >
                    {sendingEmail ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {isFreeUser && (
          <div className={`${theme.glass} rounded-2xl p-8 text-center ${theme.border.accent} border-2`}>
            <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className={`${theme.text.primary} text-2xl font-bold mb-3`}>
              Unlock Your Full Potential
            </h3>
            <p className={`${theme.text.secondary} mb-6 max-w-2xl mx-auto`}>
              Upgrade to a paid plan to access mock interviews, AI tools, resume reviews, and more. 
              Start your journey to landing your dream job today!
            </p>
            <Link to="/mentee/book">
              <Button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-8 py-3 text-lg">
                <Crown className="w-5 h-5 mr-2" />
                View Plans & Upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeDashboard;
