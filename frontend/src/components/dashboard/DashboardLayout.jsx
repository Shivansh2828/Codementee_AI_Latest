import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, Menu, X, ShoppingCart, Building2, Clock, ClipboardList, CalendarPlus, Video, DollarSign, Brain, FileText, MessageCircle, BarChart3, TrendingUp, ChevronDown, Bug, Briefcase, Target, Crown } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { Badge } from '../ui/badge';
import BugReportModal from '../BugReportModal';
import NotificationBell from '../NotificationBell';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/bug-reports', label: 'Bug Reports', icon: Bug },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
        { path: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
        { path: '/admin/resume-reviews', label: 'Resume Reviews', icon: FileText },
        { path: '/admin/payouts', label: 'Mentor Payouts', icon: DollarSign },
        { path: '/admin/companies', label: 'Companies', icon: Building2 },
        { path: '/admin/time-slots', label: 'Time Slots', icon: Clock },
        { path: '/admin/meet-links', label: 'Meet Links', icon: Video },
        { path: '/admin/mentees', label: 'Mentees', icon: Users },
        { path: '/admin/mentors', label: 'Mentors', icon: Users },
        { path: '/admin/mocks', label: 'Mock Interviews', icon: Calendar },
        { path: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
        { 
          label: 'Analytics', 
          icon: BarChart3, 
          isSection: true,
          items: [
            { path: '/admin/sessions', label: 'Session Monitor', icon: Calendar },
            { path: '/admin/mentor-analytics', label: 'Mentor Analytics', icon: Users },
            { path: '/admin/booking-analytics', label: 'Booking Analytics', icon: TrendingUp },
            { path: '/admin/revenue', label: 'Revenue Tracker', icon: DollarSign },
          ]
        },
      ];
    } else if (user?.role === 'mentor') {
      return [
        { path: '/mentor', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/mentor/slots', label: 'My Availability', icon: Clock },
        { path: '/mentor/mocks', label: 'My Sessions', icon: Calendar },
        { path: '/mentor/mentees', label: 'My Mentees', icon: Users },
        { path: '/mentor/payouts', label: 'My Payouts', icon: DollarSign },
        { path: '/mentor/feedbacks', label: 'Feedbacks', icon: MessageSquare },
        { path: '/mentor/bug-reports', label: 'My Bug Reports', icon: Bug },
      ];
    } else {
      // Check if user is free or paid
      const isFreeUser = user?.status === 'Free' || !user?.plan_id;
      
      return [
        { path: '/mentee', label: 'Dashboard', icon: LayoutDashboard },
        { path: isFreeUser ? '/mentee/book' : '/mentee/slots', label: isFreeUser ? 'Upgrade Plan' : 'Book Interview', icon: CalendarPlus },
        { path: '/mentee/mocks', label: 'My Interviews', icon: Calendar },
        { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: MessageSquare },
        { path: '/mentee/bug-reports', label: 'My Bug Reports', icon: Bug },
        { 
          label: 'AI Tools', 
          icon: Brain, 
          isSection: true,
          items: [
            { path: '/mentee/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
            { path: '/mentee/interview-prep', label: 'Interview Prep', icon: Brain },
          ]
        },
        { path: '/mentee/community', label: 'Community', icon: MessageCircle },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`min-h-screen ${theme.bg.gradient}`}>
      {/* Mobile header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme.glass} ${theme.border.primary} border-b ${theme.shadow}`}>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Codementee</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBugReportOpen(true)}
            className={`${theme.text.secondary} hover:text-red-500 p-2 rounded-lg transition-colors`}
            title="Report a Bug"
          >
            <Bug size={20} />
          </button>
          <ThemeToggle />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`${theme.text.secondary} p-2 ${theme.button.ghost} rounded-lg transition-colors`}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar - Full height, fixed position */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.glass} ${theme.border.primary} border-r ${theme.shadow} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-full`}>
          {/* Header - Fixed */}
          <div className={`p-6 ${theme.border.primary} border-b flex items-center justify-between flex-shrink-0`}>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Codementee</Link>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Navigation - Scrollable */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item, index) => {
              if (item.isSection) {
                return (
                  <div key={index} className="space-y-1">
                    <div className={`px-4 py-2 ${theme.text.muted} text-sm font-medium uppercase tracking-wide`}>
                      <div className="flex items-center gap-2">
                        <item.icon size={16} />
                        {item.label}
                      </div>
                    </div>
                    {item.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-8 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
                              : `${theme.text.secondary} ${theme.bg.hover}`
                          }`}
                        >
                          <SubIcon size={18} />
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                );
              } else {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
                        : `${theme.text.secondary} ${theme.bg.hover}`
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>

          {/* Report Bug Button - Fixed at Bottom */}
          <div className={`p-4 border-t ${theme.border.primary} flex-shrink-0`}>
            <button
              onClick={() => {
                setBugReportOpen(true);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${theme.text.secondary} hover:bg-red-500/10 hover:text-red-500 ${theme.border.primary} border border-dashed`}
            >
              <Bug size={20} />
              <span className="font-medium">Report a Bug</span>
            </button>
          </div>
        </aside>

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-y-auto pt-20 lg:pt-0">
          <div className="p-6 lg:p-8">
            {/* Page Header with Profile Dropdown */}
            <div className="flex items-center justify-between mb-8">
              <div>
                {title && (
                  <>
                    <h1 className={`heading-2 ${theme.text.primary} mb-2`}>{title}</h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </>
                )}
              </div>
              
              {/* Profile Dropdown - Desktop & Mobile */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell />
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.hover} transition-colors`}
                  >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`${theme.text.primary} text-sm font-medium truncate max-w-[120px]`}>
                      {user?.name}
                    </p>
                    <p className={`${theme.text.muted} text-xs`}>
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`${theme.text.secondary} transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-72 ${theme.glass} ${theme.border.primary} border rounded-xl ${theme.shadow} overflow-hidden z-50`}>
                    {/* Profile Header */}
                    <div className={`p-4 ${theme.bg.secondary} border-b ${theme.border.primary}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`${theme.text.primary} font-semibold truncate`}>
                            {user?.name}
                          </p>
                          <p className={`${theme.text.muted} text-xs truncate`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${user?.status === 'Free' || !user?.plan_id ? 'bg-gray-600/20 text-gray-400' : 'bg-[#06b6d4]/20 text-[#06b6d4]'} border-0 text-xs`}>
                        {user?.status === 'Free' || !user?.plan_id ? 'Free Tier' : 
                         user?.plan_id === 'starter' ? 'Starter' :
                         user?.plan_id === 'pro' ? 'Pro' :
                         user?.plan_id === 'elite' ? 'Elite' : user?.plan_name || 'Free Tier'}
                      </Badge>
                    </div>

                    {/* Profile Details */}
                    <div className="p-3 space-y-2">
                      {user?.current_role && (
                        <div className="flex items-start gap-2 px-2 py-1.5">
                          <Briefcase size={16} className={`${theme.text.muted} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`${theme.text.muted} text-xs`}>Current Role</p>
                            <p className={`${theme.text.primary} text-sm truncate`}>{user.current_role}</p>
                          </div>
                        </div>
                      )}
                      
                      {user?.target_role && (
                        <div className="flex items-start gap-2 px-2 py-1.5">
                          <Target size={16} className={`${theme.text.muted} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`${theme.text.muted} text-xs`}>Target Role</p>
                            <p className={`${theme.text.primary} text-sm truncate`}>{user.target_role}</p>
                          </div>
                        </div>
                      )}

                      {user?.created_at && (
                        <div className="flex items-start gap-2 px-2 py-1.5">
                          <Calendar size={16} className={`${theme.text.muted} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`${theme.text.muted} text-xs`}>Member Since</p>
                            <p className={`${theme.text.primary} text-sm`}>
                              {new Date(user.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={`p-2 border-t ${theme.border.primary}`}>
                      {user?.role === 'mentee' && (
                        <>
                          {/* Free User - Show Upgrade to Plans */}
                          {(user?.status === 'Free' || !user?.plan_id) && (
                            <Link 
                              to="/mentee/book"
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.hover} ${theme.text.primary} transition-colors w-full mb-1`}
                            >
                              <Crown size={16} className="text-[#06b6d4]" />
                              <span className="text-sm font-medium">Upgrade to Paid Plan</span>
                            </Link>
                          )}
                          
                          {/* Starter User - Upgrade to Pro */}
                          {user?.plan_id === 'starter' && (
                            <Link 
                              to="/mentee/book"
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 ${theme.text.primary} transition-colors w-full mb-1`}
                            >
                              <Crown size={16} className="text-[#06b6d4]" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Upgrade to Pro</p>
                                <p className={`${theme.text.muted} text-xs`}>Get 3 mocks + more features</p>
                              </div>
                            </Link>
                          )}
                          
                          {/* Pro User - Upgrade to Elite */}
                          {user?.plan_id === 'pro' && (
                            <Link 
                              to="/mentee/book"
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 ${theme.text.primary} transition-colors w-full mb-1`}
                            >
                              <Crown size={16} className="text-purple-400" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Upgrade to Elite</p>
                                <p className={`${theme.text.muted} text-xs`}>Get 6 mocks + premium perks</p>
                              </div>
                            </Link>
                          )}
                          
                          {/* Elite User or Out of Quota - Buy Single Mock */}
                          {(user?.plan_id === 'elite' || (user?.interview_quota_remaining === 0 && user?.plan_id)) && (
                            <Link 
                              to="/mentee/book"
                              onClick={() => setProfileDropdownOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 ${theme.text.primary} transition-colors w-full mb-1`}
                            >
                              <Calendar size={16} className="text-green-400" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Buy Single Mock</p>
                                <p className={`${theme.text.muted} text-xs`}>₹2,499 per interview</p>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.hover} ${theme.text.secondary} transition-colors w-full`}
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
            
            <div className={`${theme.glass} rounded-2xl ${theme.border.primary} border ${theme.shadow} p-6 lg:p-8`}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay - Only on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Bug Report Modal */}
      <BugReportModal isOpen={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
