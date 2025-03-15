import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme preference key for localStorage - for app-wide default
const THEME_PREFERENCE_KEY = 'theme_preference';

// Wrapper ThemeProvider that doesn't depend on AuthContext
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with app-wide default theme
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(THEME_PREFERENCE_KEY) as ThemeMode | null;
    return savedTheme || 'light';
  });

  // Generate the MUI theme based on current mode
  const theme = React.useMemo(() => createTheme(mode), [mode]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_PREFERENCE_KEY, mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 