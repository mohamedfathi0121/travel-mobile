import { useAppTheme } from "@/ThemeContext";

export function useColorScheme() {
  return useAppTheme().theme;
}
