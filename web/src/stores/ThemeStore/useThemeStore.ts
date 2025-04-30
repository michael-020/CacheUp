import { create } from "zustand";

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDark;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      // Update document class when theme changes
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: newTheme };
    }),
  setTheme: (value) => {
    localStorage.setItem('theme', value ? 'dark' : 'light');
    // Update document class when theme is set
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark: value });
  }
}));

// Initialize theme on store creation
const initialTheme = localStorage.getItem('theme') === 'dark';
if (initialTheme) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}