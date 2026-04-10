import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // default dark
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // All values reference CSS custom properties defined in index.css.
  // This means colors swap automatically when .dark class toggles — no JS ternaries needed.
  const theme = {
    bg: {
      primary:  'bg-[var(--bg-primary)]',
      secondary:'bg-[var(--bg-secondary)]',
      tertiary: 'bg-[var(--bg-tertiary)]',
      card:     'bg-[var(--bg-card)]',
      cardAlt:  'bg-[var(--bg-card)]',
      hover:    'hover:bg-[var(--bg-tertiary)]',
      gradient: isDark
        ? 'bg-gradient-to-br from-[#0d0d0d] via-[#171717] to-[#0d0d0d]'
        : 'bg-gradient-to-br from-white via-blue-50 to-cyan-50',
    },
    text: {
      primary:   'text-[var(--text-primary)]',
      secondary: 'text-[var(--text-secondary)]',
      muted:     'text-[var(--text-muted)]',
      accent:    'text-[var(--accent)]',
    },
    border: {
      primary:  'border-[var(--border-primary)]',
      secondary:'border-[var(--border-secondary)]',
      cardAlt:  'border-[var(--border-primary)]',
      accent:   'border-[var(--accent)]',
    },
    button: {
      primary: 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white',
      secondary: 'bg-[var(--bg-card)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-secondary)]',
      ghost: 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    },
    input: {
      base: 'bg-[var(--bg-card)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)]',
    },
    glass: isDark
      ? 'bg-[#171717]/90 backdrop-blur-sm border-[#404040]/50'
      : 'bg-white/80 backdrop-blur-sm border-gray-200/50',
    shadow:   'shadow-[var(--shadow-xl)]',
    shadowMd: 'shadow-[var(--shadow-md)]',
    shadowLg: 'shadow-[var(--shadow-lg)]',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
