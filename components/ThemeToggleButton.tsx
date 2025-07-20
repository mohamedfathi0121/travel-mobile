import { Pressable, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { useAppTheme } from "@/ThemeContext";

export function ThemeToggleButton() {
  const { theme, setTheme } = useAppTheme();
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor(
    { light: "#e8edf2", dark: "#1e293b" },
    "input"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const currentIcon = theme === "dark" ? "moon.fill" : "sun.max.fill";
  const buttonText = `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`;

  return (
    <Pressable onPress={toggleTheme}>
      <ThemedView style={[styles.button, { borderColor }]}>
        <IconSymbol name={currentIcon} size={20} color={iconColor} />
        <ThemedText>{buttonText}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
  },
});
