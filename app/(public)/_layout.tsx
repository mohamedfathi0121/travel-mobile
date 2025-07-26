import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useColorScheme } from "@/hooks/useColorScheme";
import { HapticTab } from "@/components/HapticTab";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function PublicTabs() {
  const colorScheme = useColorScheme();

  // ✅ New Theme Colors
  const activeTint    = useThemeColor({}, "buttonPrimary");
  const inactiveTint = colorScheme === "dark" ? "#9ca3af" : "#94a3b8";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarButton: HapticTab,
   
        tabBarStyle: [
  
       
          Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        ],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
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
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}



