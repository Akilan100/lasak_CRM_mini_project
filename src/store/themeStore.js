import create from "zustand";

const useThemeStore = create((set) => ({
  dark: false,
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { dark: next };
    }),
}));

export default useThemeStore;
