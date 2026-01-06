import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme) => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const actualTheme = currentTheme === "system"
        ? (mediaQuery.matches ? "dark" : "light")
        : currentTheme;

      // Force a synchronous update to the DOM
      root.classList.remove("light", "dark");
      root.classList.add(actualTheme);
      
      // Also apply to body for extra coverage
      document.body.classList.remove("light", "dark");
      document.body.classList.add(actualTheme);
      
      root.style.colorScheme = actualTheme;
      console.log("Applied theme:", actualTheme);
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e) => {
        applyTheme("system");
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
