import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('light');

  const toggleTheme = () => {
    // Toggling is ignored for now as dark mode is disabled per requirements
    // To enable later: setTheme(prev => prev === 'light' ? 'dark' : 'light');
    console.log("Dark mode is disabled for now but supported in architecture.");
  };

  useEffect(() => {
    const root = window.document.documentElement;
    // Always apply light theme, remove dark
    root.classList.remove('dark');
    root.classList.add('light');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
