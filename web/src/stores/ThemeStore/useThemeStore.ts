import { create } from "zustand";

interface IThemeStore {
  theme: string;
  isDark: boolean;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<IThemeStore>((set) => ({
  theme: localStorage.getItem("theme") || "light",
  isDark: localStorage.getItem("theme") === "dark",
  
  setTheme: (theme: "dark" | "light") => {
    // Update localStorage
    localStorage.setItem("theme", theme);
    
    // Update document classes
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    
    // Update store state
    set({ theme, isDark: theme === "dark" });
  },
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      
      // Update localStorage
      localStorage.setItem("theme", newTheme);
      
      // Update document classes
      document.body.classList.toggle("dark", newTheme === "dark");
      
      // Return new state
      return { theme: newTheme, isDark: newTheme === "dark" };
    });
  }
}));