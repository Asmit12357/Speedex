import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'speedex-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Check local storage
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // LocalStorage access may be restricted
    }

    // 2. Default to dark for network diagnostics dashboard
    return 'dark';
  });

  useEffect(() => {
    // Set data-theme on documentElement
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme, setTheme };
}
