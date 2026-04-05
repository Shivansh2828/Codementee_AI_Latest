import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, Briefcase, Target, Search, Users } from 'lucide-react';
import { siteConfig } from '../../data/mock';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { href: '/ai-agents', label: 'AI Agents' },
    { href: '/learn', label: 'Courses' },
    { href: '/#pricing', label: 'Pricing' },
  ];

  const scrollToSection = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.replace('/#', '');
      if (location.pathname !== '/') {
        window.location.href = href;
        return;
      }
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMenuOpen(false);
    } else if (href.startsWith('/')) {
      // Regular internal link — let React Router handle it
      e.preventDefault();
      navigate(href);
      setIsMenuOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'mentor') return '/mentor';
    if (user.role === 'agent_user') return '/mentee/job-search';
    return '/mentee';
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isFreeUser = !user?.plan_id || user?.plan_id?.startsWith('agent_');
  const isAgentUser = user?.role === 'agent_user';
  // Agent plan on a mentee is an add-on, not a tier upgrade
  const hasAgentAddon = user?.role === 'mentee' && user?.plan_id?.startsWith('agent_');

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${theme.glass} ${theme.border.primary} border-b shadow-sm`}>
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="brand-text bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 ui-medium`}
              >
                {link.label}
              </a>
            ))}

            <ThemeToggle />

            {isAuthenticated && user ? (
              /* Logged-in user dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bg.hover} transition-colors`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`${theme.text.primary} text-sm font-medium max-w-[100px] truncate`}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`${theme.text.secondary} transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className={`absolute right-0 mt-2 w-56 ${theme.glass} ${theme.border.primary} border rounded-xl ${theme.shadow} overflow-hidden z-50`}>
                    {/* User info */}
                    <div className={`px-4 py-3 ${theme.bg.secondary} border-b ${theme.border.primary}`}>
                      <p className={`${theme.text.primary} font-semibold text-sm truncate`}>{user.name}</p>
                      <p className={`${theme.text.muted} text-xs truncate`}>{user.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                        isAgentUser ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                        isFreeUser ? 'bg-gray-600/20 text-gray-400' :
                        'bg-[#06b6d4]/20 text-[#06b6d4]'
                      }`}>
                        {isAgentUser ? 'AI Agent' :
                         isFreeUser ? (hasAgentAddon ? 'Free + AI Agent' : 'Free Tier') :
                         user.plan_id === 'starter' ? 'Starter' :
                         user.plan_id === 'pro' ? 'Pro' :
                         user.plan_id === 'elite' ? 'Elite' :
                         user.role === 'agent_user' ? 'AI Agent' :
                         user.role === 'admin' ? 'Admin' :
                         user.role === 'mentor' ? 'Mentor' : 'Active'}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="p-2">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.secondary} ${theme.bg.hover} transition-colors w-full`}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>

                      {(user.role === 'mentee' || user.role === 'agent_user') && (
                        <>
                          <Link
                            to="/mentee/job-search"
                            onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.secondary} ${theme.bg.hover} transition-colors w-full`}
                          >
                            <Search size={16} />
                            AI Job Search
                          </Link>
                          <Link
                            to="/mentee/referral-finder"
                            onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.secondary} ${theme.bg.hover} transition-colors w-full`}
                          >
                            <Users size={16} />
                            Referral Finder
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.secondary} ${theme.bg.hover} transition-colors w-full mt-1 border-t ${theme.border.primary} pt-2`}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <>
                <Link to="/login" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 font-medium`}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && user && (
              <div className="w-8 h-8 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t ${theme.border.primary} ${theme.glass}`}>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 font-medium py-2`}
                >
                  {link.label}
                </a>
              ))}

              {isAuthenticated && user ? (
                <>
                  <div className={`py-2 border-t ${theme.border.primary}`}>
                    <p className={`${theme.text.primary} font-semibold text-sm`}>{user.name}</p>
                    <p className={`${theme.text.muted} text-xs`}>{user.email}</p>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 ${theme.text.secondary} font-medium py-2`}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  {(user.role === 'mentee' || user.role === 'agent_user') && (
                    <>
                      <Link to="/mentee/job-search" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 ${theme.text.secondary} font-medium py-2`}>
                        <Search size={16} /> AI Job Search
                      </Link>
                      <Link to="/mentee/referral-finder" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 ${theme.text.secondary} font-medium py-2`}>
                        <Users size={16} /> Referral Finder
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 ${theme.text.secondary} font-medium py-2 text-left`}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 font-medium py-2`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
