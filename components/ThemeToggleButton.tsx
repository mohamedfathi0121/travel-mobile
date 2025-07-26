import { View, Switch, StyleSheet, useColorScheme } from "react-native";
import { useAppTheme } from "@/ThemeContext";
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export function ThemeToggleButton() {
  const { theme, setTheme } = useAppTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </ThemedText>
      <Switch
        value={theme === "dark"} // ✅ ON when dark mode
        onValueChange={toggleTheme}
        thumbColor ={buttonPrimary}
        trackColor={{ false: "#cbd5e1", true: "#1e293b" }} // Gray for light, dark for dark mode
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
  },
});
