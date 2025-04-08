import { create } from "zustand";

type ThemeState = {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDark
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      return { isDark: newTheme }
    }),
  setTheme: (value) => {
    localStorage.setItem('theme', value ? 'dark' : 'light')
    set({ isDark: value })
  }
}))