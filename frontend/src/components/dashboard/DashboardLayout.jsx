import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, Menu, X, ShoppingCart, Building2, Clock, ClipboardList, CalendarPlus, Video } from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
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
        { path: '/mentor/feedbacks', label: 'Feedbacks', icon: MessageSquare },
      ];
    } else {
      return [
        { path: '/mentee', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/mentee/book', label: 'Schedule Mock', icon: CalendarPlus },
        { path: '/mentee/mocks', label: 'My Mocks', icon: Calendar },
        { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: MessageSquare },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#334155]">
        <span className="text-xl font-bold text-white">Codementee</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-[#334155] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
          <div className="p-6 border-b border-[#334155] hidden lg:block">
            <Link to="/" className="text-xl font-bold text-white">Codementee</Link>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#06b6d4] text-[#0f172a]' : 'text-slate-300 hover:bg-[#334155]'}`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#334155]">
            <div className="px-4 py-2 mb-2">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-sm capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-[#334155] rounded-lg transition-colors">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-6 lg:p-8">
            {title && <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>}
            {children}
          </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default DashboardLayout;
