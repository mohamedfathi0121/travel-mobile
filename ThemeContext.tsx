import React, { createContext, useContext, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ColorScheme = "light" | "dark";
type ThemePreference = ColorScheme | "system";

interface ThemeContextType {
  theme: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
}

const AppThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useSystemColorScheme() ?? "light";
  // Default to the system's theme, but allow override
  const [theme, setTheme] = useState<ColorScheme>(systemTheme);

  // If the system theme changes, update the app theme
  // This is only active if the user hasn't manually set a theme
  // For simplicity, we'll let the user's manual choice persist.
  // A more advanced implementation could track 'system' preference.

  const value = {
    theme,
    setTheme,
  };

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

/**
 * A custom hook to access the theme context.
 */
export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
}
