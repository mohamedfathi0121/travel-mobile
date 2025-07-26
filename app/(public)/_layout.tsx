import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useColorScheme } from "@/hooks/useColorScheme";
import { HapticTab } from "@/components/HapticTab";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function PublicTabs() {
  const colorScheme = useColorScheme();

  const activeTint = useThemeColor({}, "buttonPrimary");
  const background = useThemeColor({}, "background");
  const secondaryText = useThemeColor({}, "textSecondary");
  const inactiveTint = colorScheme === "dark" ? "#9ca3af" : "#94a3b8";

  // ✅ Super strong shadow values
  const shadowColor = "#000";
  const shadowOpacity = colorScheme === "dark" ? 0.8 : 0.3;
  const shadowRadius = colorScheme === "dark" ? 10 : 6;
  const elevation = colorScheme === "dark" ? 20 : 10;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarButton: HapticTab,

        // ✅ Bottom Tab Bar (max shadow)
        tabBarStyle: [
          {
            backgroundColor: background,
            borderTopWidth: 0,
            shadowColor,
            shadowOpacity,
            shadowRadius,
            shadowOffset: { width: 0, height: -2 }, // ✅ iOS tweak (shadow above tab)
            elevation, // ✅ Android max shadow
          },
          Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        ],

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        // ✅ Top Header Bar (max shadow)
        headerStyle: {
          backgroundColor: background,
          shadowColor,
          shadowOpacity,
          shadowRadius,
          shadowOffset: { width: 0, height: 4 }, // ✅ iOS tweak
          elevation,
        },
        headerTitleStyle: {
          color: secondaryText,
          fontSize: 18,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-in" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Register"
        options={{
          title: "Register",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="More"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
