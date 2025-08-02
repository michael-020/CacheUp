import { create } from "zustand";

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (value: boolean) => void;
}

const isClient = typeof window !== 'undefined';
const getInitialTheme = () => {
  if (!isClient) return false; // Default to light theme on server
  const storedTheme = localStorage.getItem('theme');
  // If no theme is stored, return true for dark theme
  return storedTheme === null ? true : storedTheme === 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDark;
      if (isClient) {
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDark: newTheme };
    }),
  setTheme: (value) => {
    if (isClient) {
      localStorage.setItem('theme', value ? 'dark' : 'light');
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ isDark: value });
  }
}));

// Only run this on the client
if (isClient) {
  const storedTheme = localStorage.getItem('theme');
  if (!storedTheme) {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  }
}