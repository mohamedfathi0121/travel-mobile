// TripTabs.tsx
import { Colors } from "@/constants/Colors"; // تأكد من المسار الصحيح
import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const tabs = ["Approved", "Completed"];

interface TripTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const TripTabs: React.FC<TripTabsProps> = ({ currentTab, setCurrentTab }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && { borderColor: theme.textPrimary }]}
            onPress={() => setCurrentTab(tab)}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: theme.textSecondary },
                isActive && {
                  color: theme.textPrimary,
                  fontWeight: "600",
                },
              ]}
            >
              {tab}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
};

export default TripTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
});
