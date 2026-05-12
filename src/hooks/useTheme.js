import { useState, useEffect, useCallback } from 'react';
import { KEYS, getFromStorage, setToStorage } from '../data/schema';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return getFromStorage(KEYS.THEME, 'light');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    setToStorage(KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, toggleTheme };
};