import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Calendar, Users, Server, Code, MessageSquare, Layers, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Map icon name strings to Lucide components (same pattern as ContentCard)
const iconMap = {
  Calendar,
  Users,
  Server,
  Code,
  MessageSquare,
  Layers,
  FileText,
};

const NavigationDropdown = ({ label, items, isOpen, onOpen, onClose }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on click outside (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMobile, isOpen, onClose]);

  const handleItemClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.replace('/#', '');
      if (location.pathname !== '/') {
        window.location.href = href;
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    onClose();
  };

  // Desktop: hover handlers — explicit open/close, no toggle
  const desktopHandlers = !isMobile
    ? {
        onMouseEnter: () => onOpen(),
        onMouseLeave: () => onClose(),
      }
    : {};

  return (
    <div className="relative" ref={dropdownRef} {...desktopHandlers}>
      {/* Trigger button */}
      <button
        onClick={() => { if (isMobile) { isOpen ? onClose() : onOpen(); } }}
        className={`flex items-center gap-1 min-h-[44px] min-w-[44px] px-1 ${theme.text.secondary} hover:text-[#06b6d4] transition-colors duration-200 font-medium`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel — wrapped in an invisible bridge div to prevent gap-closing */}
      {isOpen && (
        <div
          className={`${
            isMobile
              ? 'relative mt-1 w-full'
              : `absolute top-full left-0 pt-2 min-w-[220px]`
          } z-50`}
        >
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.shadow} overflow-hidden`}>
            <div className="p-1.5">
              {items.map((item) => {
                const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
                const isScrollTarget = item.href.startsWith('/#');

                const content = (
                  <span className="flex items-center gap-3">
                    {IconComponent && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06b6d4]/10">
                        <IconComponent size={16} className="text-[#06b6d4]" />
                      </span>
                    )}
                    <span className={`text-sm font-medium ${theme.text.primary}`}>
                      {item.label}
                    </span>
                  </span>
                );

                const className = `flex items-center w-full min-h-[44px] px-3 py-2 rounded-lg ${theme.bg.hover} transition-colors duration-150`;

                if (isScrollTarget) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleItemClick(e, item.href)}
                      className={className}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationDropdown;
