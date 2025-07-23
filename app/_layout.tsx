
import { AuthProvider } from "@/context/AuthContext"; // ✅ استيراد AuthProvider


// In app/_layout.tsx


import AllTrips from "@/components/AllTrips";


import { AppThemeProvider, useAppTheme } from "@/ThemeContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router"; // No more 'router' import
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

function RootLayoutNav() {
  const { theme } = useAppTheme();
  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        {/* <Stack.Screen name="booking-confirmed" options={{ headerShown: false }} /> */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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

      <RootLayoutNav />
      

    </AppThemeProvider>
  );
}