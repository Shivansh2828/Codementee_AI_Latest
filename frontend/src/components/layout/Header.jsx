import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '../../data/mock';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  const navLinks = [
    { href: '/#pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Get Started' }
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
    }
  };

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
            {navLinks.slice(0, -2).map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 ui-medium`}
              >
                {link.label}
              </a>
            ))}
            <Link to="/login" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 font-medium`}>
              Login
            </Link>
            <ThemeToggle />
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
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
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.href === '/register' ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors duration-200 font-medium py-2`}
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
