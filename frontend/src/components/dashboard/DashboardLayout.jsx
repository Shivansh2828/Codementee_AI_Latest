import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, Menu, X, ShoppingCart, Building2, Clock, ClipboardList, CalendarPlus, Video, DollarSign, Brain, FileText, MessageCircle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
        { path: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
        { path: '/admin/payouts', label: 'Mentor Payouts', icon: DollarSign },
        { path: '/admin/companies', label: 'Companies', icon: Building2 },
        { path: '/admin/time-slots', label: 'Time Slots', icon: Clock },
        { path: '/admin/meet-links', label: 'Meet Links', icon: Video },
        { path: '/admin/mentees', label: 'Mentees', icon: Users },
        { path: '/admin/mentors', label: 'Mentors', icon: Users },
        { path: '/admin/mocks', label: 'Mock Interviews', icon: Calendar },
        { path: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
      ];
    } else if (user?.role === 'mentor') {
      return [
        { path: '/mentor', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/mentor/booking-requests', label: 'Booking Requests', icon: ClipboardList },
        { path: '/mentor/mentees', label: 'My Mentees', icon: Users },
        { path: '/mentor/mocks', label: 'Mock Interviews', icon: Calendar },
        { path: '/mentor/payouts', label: 'My Payouts', icon: DollarSign },
        { path: '/mentor/feedbacks', label: 'Feedbacks', icon: MessageSquare },
      ];
    } else {
      return [
        { path: '/mentee', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/mentee/book', label: 'Schedule Mock', icon: CalendarPlus },
        { path: '/mentee/mocks', label: 'My Interviews', icon: Calendar },
        { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: MessageSquare },
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
      <div className={`lg:hidden flex items-center justify-between p-4 ${theme.glass} ${theme.border.primary} border-b ${theme.shadow}`}>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Codementee</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`${theme.text.secondary} p-2 ${theme.button.ghost} rounded-lg transition-colors`}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.glass} ${theme.border.primary} border-r ${theme.shadow} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className={`p-6 ${theme.border.primary} border-b hidden lg:flex items-center justify-between`}>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Codementee</Link>
            <ThemeToggle />
          </div>
          <nav className="p-4 space-y-1">
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
          <div className={`absolute bottom-0 left-0 right-0 p-4 ${theme.border.primary} border-t ${theme.bg.secondary}`}>
            <div className="px-4 py-2 mb-2">
              <p className={`${theme.text.primary} ui-medium truncate`}>{user?.name}</p>
              <p className={`${theme.text.muted} body-small capitalize`}>{user?.role}</p>
            </div>
            <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 w-full ${theme.text.secondary} ${theme.bg.hover} rounded-lg transition-colors`}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-6 lg:p-8">
            {title && (
              <div className="mb-8">
                <h1 className={`heading-2 ${theme.text.primary} mb-2`}>{title}</h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </div>
            )}
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
    </div>
  );
};

export default DashboardLayout;
