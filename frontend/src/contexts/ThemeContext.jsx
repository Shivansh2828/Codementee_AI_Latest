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
    // Check localStorage first, then default to dark theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Default to dark theme instead of system preference
    return true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update document class for global styles
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Theme-aware CSS classes
  const theme = {
    // Backgrounds - Using softer dark grays for better readability
    bg: {
      primary: isDark ? 'bg-[#0d0d0d]' : 'bg-white',
      secondary: isDark ? 'bg-[#171717]' : 'bg-gray-50',
      tertiary: isDark ? 'bg-[#262626]' : 'bg-gray-100',
      card: isDark ? 'bg-[#171717]' : 'bg-white',
      cardAlt: isDark ? 'bg-[#171717]' : 'bg-white',
      hover: isDark ? 'hover:bg-[#262626]' : 'hover:bg-gray-100',
      gradient: isDark 
        ? 'bg-gradient-to-br from-[#0d0d0d] via-[#171717] to-[#0d0d0d]'
        : 'bg-gradient-to-br from-white via-blue-50 to-cyan-50',
    },
    
    // Text colors - Enhanced contrast for readability
    text: {
      primary: isDark ? 'text-gray-100' : 'text-gray-900',
      secondary: isDark ? 'text-gray-400' : 'text-gray-600',
      muted: isDark ? 'text-gray-500' : 'text-gray-500',
      accent: 'text-[#06b6d4]',
    },
    
    // Borders - Visible but subtle
    border: {
      primary: isDark ? 'border-[#404040]' : 'border-gray-200',
      secondary: isDark ? 'border-[#525252]' : 'border-gray-300',
      cardAlt: isDark ? 'border-[#404040]' : 'border-gray-200',
      accent: 'border-[#06b6d4]',
    },
    
    // Buttons
    button: {
      primary: 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white',
      secondary: isDark 
        ? 'bg-[#262626] hover:bg-[#404040] text-gray-100 border border-[#525252]'
        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
      ghost: isDark 
        ? 'hover:bg-[#262626] text-gray-400 hover:text-gray-100'
        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    },
    
    // Form elements
    input: {
      base: isDark 
        ? 'bg-[#171717] border-[#525252] text-gray-100 placeholder-gray-500 focus:border-[#06b6d4]'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#06b6d4]',
    },
    
    // Special effects
    glass: isDark
      ? 'bg-[#171717]/90 backdrop-blur-sm border-[#404040]/50'
      : 'bg-white/80 backdrop-blur-sm border-gray-200/50',
    
    // Shadows - More visible in dark mode
    shadow: isDark 
      ? 'shadow-xl shadow-black/60'
      : 'shadow-xl shadow-gray-900/10',
    shadowMd: isDark
      ? 'shadow-md shadow-black/40'
      : 'shadow-md shadow-gray-900/5',
    shadowLg: isDark
      ? 'shadow-lg shadow-black/50'
      : 'shadow-lg shadow-gray-900/8',
  };

  const value = {
    isDark,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};