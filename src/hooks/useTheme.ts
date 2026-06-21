import { useState, useCallback, useEffect } from 'react';
import { useThemeStore } from '../lib/store';

interface UseThemeReturn {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  const { isDark, toggleTheme: storeToggle, setTheme } = useThemeStore();

  const theme = isDark ? 'dark' : 'light';

  const toggleTheme = useCallback(() => {
    storeToggle();
  }, [storeToggle]);

  return { theme, toggleTheme };
};
