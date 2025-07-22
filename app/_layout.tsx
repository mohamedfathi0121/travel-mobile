import { AuthProvider } from "@/context/AuthContext"; // ✅ استيراد AuthProvider
import { AppThemeProvider, useAppTheme } from "@/ThemeContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

function RootLayoutNav() {
  const { theme } = useAppTheme();

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <AuthProvider>
        {" "}
        {/* ✅ ضفنا الـ AuthProvider هنا */}
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}
