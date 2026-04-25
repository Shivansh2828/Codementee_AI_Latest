import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, Menu, X, ShoppingCart, Building2, Clock, ClipboardList, CalendarPlus, DollarSign, FileText, MessageCircle, BarChart3, TrendingUp, ChevronDown, ChevronRight, Bug, Briefcase, Target, Crown, Headphones, Search, Lock, GraduationCap, Server, Code, Layers, Receipt, Bot, CreditCard, Terminal, Cpu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { Badge } from '../ui/badge';
import BugReportModal from '../BugReportModal';
import NotificationBell from '../NotificationBell';
import api from '../../utils/api';
import { sidebarConfig } from '../../data/navigationConfig';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { currency, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [starterPrice, setStarterPrice] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ 'ai-tools': true, learn: true, coaching: true, community: true });
  const dropdownRef = useRef(null);

  // Map icon string names from navigationConfig to Lucide components
  const iconMap = {
    LayoutDashboard, GraduationCap, Server, Code, MessageSquare, Layers,
    Target, FileText, Search, Headphones, CalendarPlus, Calendar,
    Users, MessageCircle, Receipt, Bot, Briefcase, CreditCard,
    Terminal, Cpu,
  };

  const getIcon = (iconName) => iconMap[iconName] || LayoutDashboard;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/bug-reports', label: 'Support Requests', icon: Headphones },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
        { path: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
        { path: '/admin/mentorship', label: 'Mentorship', icon: Users },
        { path: '/admin/resume-reviews', label: 'Resume Reviews', icon: FileText },
        { path: '/admin/payouts', label: 'Mentor Payouts', icon: DollarSign },
        { path: '/admin/companies', label: 'Companies', icon: Building2 },
        { path: '/admin/slots', label: 'Slot Management', icon: Clock },
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
        { path: '/mentor/slots', label: 'Manage Slots', icon: Clock },
        { path: '/mentor/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/mentor/mentorship', label: 'Mentorship Sessions', icon: Users },
        { path: '/mentor/mocks', label: 'My Sessions', icon: Calendar },
        { path: '/mentor/mentees', label: 'My Mentees', icon: Users },
        { path: '/mentor/payouts', label: 'My Payouts', icon: DollarSign },
        { path: '/mentor/feedbacks', label: 'Feedbacks', icon: MessageSquare },
        { path: '/mentor/bug-reports', label: 'Support & Help', icon: Headphones },
      ];
    } else if (user?.role === 'agent_user') {
      return [
        { path: '/mentee/job-search', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/apply', label: 'Unlock Interviews', icon: CalendarPlus, isUpgrade: true },
        { path: '/mentee/mocks', label: 'My Interviews', icon: Calendar, isLocked: true },
        { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: MessageSquare, isLocked: true },
        { path: '/mentee/resume-review', label: 'Resume Review', icon: FileText, isLocked: true },
        { path: '/mentee/bug-reports', label: 'Support & Help', icon: Headphones },
        { 
          label: 'AI Tools', 
          icon: Search, 
          isSection: true,
          items: [
            { path: '/mentee/job-search', label: 'AI Job Search', icon: Briefcase },
            { path: '/mentee/referral-finder', label: 'Referral Finder', icon: Target },
          ]
        },
        { path: '/mentee/community', label: 'Community', icon: MessageCircle, isLocked: true },
        { 
          label: 'Courses', 
          icon: GraduationCap, 
          isSection: true,
          items: [
            { path: '/learn/system-design', label: 'System Design', icon: Server },
            { path: '/learn/dsa-patterns', label: 'DSA Patterns', icon: Code },
            { path: '/learn/behavioral', label: 'Behavioral', icon: MessageSquare },
            { path: '/learn/devops', label: 'DevOps', icon: Terminal },
            { path: '/learn/linux', label: 'Linux', icon: Cpu },
          ]
        },
      ];
    } else {
      // Mentee nav is now config-driven, rendered separately
      return null;
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
            {navItems === null ? (
              /* Config-driven mentee sidebar with collapsible sections */
              sidebarConfig.mentee.map((item, index) => {
                if (item.collapsible) {
                  const SectionIcon = getIcon(item.icon);
                  const isExpanded = expandedSections[item.section];
                  const hasActiveChild = item.items.some(child => location.pathname === child.path);
                  return (
                    <div key={item.section} className="space-y-1">
                      <button
                        onClick={() => toggleSection(item.section)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          hasActiveChild
                            ? `${theme.text.primary} ${theme.bg.hover}`
                            : `${theme.text.secondary} ${theme.bg.hover}`
                        }`}
                      >
                        <SectionIcon size={20} />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {isExpanded && item.items.map((child) => {
                        const ChildIcon = getIcon(child.icon);
                        const isActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-8 py-2 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                : `${theme.text.secondary} ${theme.bg.hover}`
                            }`}
                          >
                            <ChildIcon size={18} />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  );
                } else {
                  // Top-level non-collapsible item (e.g. Dashboard)
                  const Icon = getIcon(item.icon);
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
              })
            ) : (
              /* Admin, mentor, agent_user — existing rendering */
              navItems.map((item, index) => {
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
                
                if (item.isLocked) {
                  return (
                    <div
                      key={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.text.muted} opacity-50 cursor-not-allowed`}
                    >
                      <Icon size={20} />
                      <span className="flex-1">{item.label}</span>
                      <Lock size={14} />
                    </div>
                  );
                }
                
                if (item.isUpgrade) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
                    >
                      <Crown size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                }
                
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
            })
            )}
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
                        {user?.role === 'agent_user' ? 'AI Agent' :
                         user?.status === 'Free' || !user?.plan_id || user?.plan_id?.startsWith('agent_') ? 
                         (user?.plan_id?.startsWith('agent_') ? 'Free + AI Agent' : 'Free Tier') : 
                         user?.plan_id === 'starter' ? 'Starter Plan' :
                         user?.plan_id === 'pro' ? 'Pro Plan' :
                         user?.plan_id === 'elite' ? 'Elite Plan' :
                         'Free Tier'}
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
                          {/* Transactions link */}
                          <Link 
                            to="/mentee/transactions"
                            onClick={() => setProfileDropdownOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.hover} ${theme.text.secondary} transition-colors w-full mb-1`}
                          >
                            <Receipt size={16} />
                            <span className="text-sm">Transactions</span>
                          </Link>

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
                                <p className={`${theme.text.muted} text-xs`}>3 mocks + enhanced features</p>
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
                                <p className={`${theme.text.muted} text-xs`}>6 mocks + premium features</p>
                              </div>
                            </Link>
                          )}
                          
                          
                          {/* Account needs update - quota_total is 0 but user has a paid plan */}
                          {(user?.interview_quota_total === 0 && user?.plan_id && !user?.plan_id.startsWith('agent_') && user?.status !== 'Free') && (
                            <button
                              onClick={async () => {
                                setProfileDropdownOpen(false);
                                try {
                                  // Re-login to trigger quota migration on the backend
                                  window.location.reload();
                                } catch (e) {}
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 ${theme.text.primary} transition-colors w-full mb-1`}
                            >
                              <RefreshCw size={16} className="text-yellow-400" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Update Account</p>
                                <p className={`${theme.text.muted} text-xs`}>Refresh to sync your plan details</p>
                              </div>
                            </button>
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
