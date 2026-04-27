import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Code, MessageSquare, Layers, BookOpen, Terminal, Cpu, Cloud } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Map icon name strings from learningContent.js to Lucide components
const iconMap = {
  Server,
  Code,
  MessageSquare,
  Layers,
  BookOpen,
  Terminal,
  Cpu,
  Cloud,
};

const ContentCard = ({
  icon,
  title,
  description,
  topicCount,
  href,
  isFree,
  access,
  gradient = 'from-blue-500 to-cyan-500',
  className = '',
}) => {
  const { theme } = useTheme();
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

  // Determine badge: use access string if provided, else fall back to isFree
  const accessLabel = access || (isFree ? 'Free' : 'Pro');
  const isFreeAccess = accessLabel === 'Free' || accessLabel === 'Free + Premium';

  return (
    <Link
      to={href}
      className={`group block rounded-xl border ${theme.border.primary} ${theme.bg.card} p-6 transition-all duration-300 hover:border-[#06b6d4] ${theme.shadow} hover:shadow-cyan-500/10 ${className}`}
    >
      {/* Icon with gradient background */}
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}
      >
        {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
      </div>

      {/* Title */}
      <h3 className={`mb-2 text-lg font-semibold ${theme.text.primary}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`mb-4 text-sm leading-relaxed ${theme.text.secondary}`}>
        {description}
      </p>

      {/* Badges row */}
      <div className="flex items-center gap-2">
        {/* Topic count badge */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${theme.bg.tertiary} ${theme.text.secondary}`}
        >
          {topicCount} topics
        </span>

        {/* Access indicator */}
        {isFreeAccess ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            {accessLabel}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
            {accessLabel}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ContentCard;
