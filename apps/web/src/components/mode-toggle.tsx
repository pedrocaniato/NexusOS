'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface-inset">
        <span className="w-4 h-4 opacity-0" />
      </button>
    );
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface-inset hover:bg-surface-hover transition-all duration-300 group"
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100 text-amber-400'
            : 'opacity-0 rotate-90 scale-0 text-amber-400'
        }`}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100 text-indigo-500'
            : 'opacity-0 -rotate-90 scale-0 text-indigo-500'
        }`}
      />
    </button>
  );
}
