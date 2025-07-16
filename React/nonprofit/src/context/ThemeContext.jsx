import React, { createContext, useState, useEffect, useMemo } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Function to get the initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    // Check for system preference if no theme is stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Effect to update the body class and localStorage when the theme changes
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(theme + '-mode');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};