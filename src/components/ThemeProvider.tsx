'use client';
import { useHabitStore } from '@/store/useHabitStore';
import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useHabitStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-violet', 'theme-cyber', 'theme-light', 'dark', 'light');

    if (theme === 'light') {
      root.classList.add('theme-light', 'light');
    } else if (theme === 'violet') {
      root.classList.add('theme-violet', 'dark');
    } else if (theme === 'cyber') {
      root.classList.add('theme-cyber', 'dark');
    } else {
      root.classList.add('theme-dark', 'dark');
    }
  }, [theme]);

  return <>{children}</>;
}
