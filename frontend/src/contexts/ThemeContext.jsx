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
    // Backgrounds
    bg: {
      primary: isDark ? 'bg-gray-900' : 'bg-white',
      secondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
      card: isDark ? 'bg-gray-800' : 'bg-white',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      gradient: isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-white via-blue-50 to-cyan-50',
    },
    
    // Text colors
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      muted: isDark ? 'text-gray-400' : 'text-gray-500',
      accent: 'text-[#06b6d4]',
    },
    
    // Borders
    border: {
      primary: isDark ? 'border-gray-700' : 'border-gray-200',
      secondary: isDark ? 'border-gray-600' : 'border-gray-300',
      accent: 'border-[#06b6d4]',
    },
    
    // Buttons
    button: {
      primary: 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white',
      secondary: isDark 
        ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
      ghost: isDark 
        ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    },
    
    // Form elements
    input: {
      base: isDark 
        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#06b6d4]'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#06b6d4]',
    },
    
    // Special effects
    glass: isDark
      ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50'
      : 'bg-white/80 backdrop-blur-sm border-gray-200/50',
    
    // Shadows
    shadow: isDark 
      ? 'shadow-xl shadow-black/30'
      : 'shadow-xl shadow-gray-900/10',
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