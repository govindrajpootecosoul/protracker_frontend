import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initTheme: () => void;
}

const getStoredTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'dark';
  // Default to light theme when no preference stored
  return false;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getStoredTheme(),
  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDark;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return { isDark: newTheme };
    });
  },
  setTheme: (isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    set({ isDark });
  },
  initTheme: () => {
    const isDark = getStoredTheme();
    document.documentElement.classList.toggle('dark', isDark);
    set({ isDark });
  },
}));

