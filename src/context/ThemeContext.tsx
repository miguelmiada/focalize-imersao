/**
 * @file src/context/ThemeContext.tsx
 * Gerencia o tema da aplicação (claro, escuro ou sincronizado com o sistema).
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Theme } from '../types';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(val: unknown): val is Theme {
  return val === 'light' || val === 'dark' || val === 'system';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return loadFromStorage<Theme>(STORAGE_KEYS.THEME, 'system', isTheme);
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Monitora alterações na preferência do sistema operacional
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = useMemo(() => {
    if (theme === 'system') return systemIsDark;
    return theme === 'dark';
  }, [theme, systemIsDark]);

  // Atualiza a classe no elemento <html> para estilização do Tailwind
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveToStorage(STORAGE_KEYS.THEME, newTheme);
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
