// TripTabs.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const tabs = ["On Going", "Completed"];

interface TripTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function TripTabs({ currentTab, setCurrentTab }: TripTabsProps) {
  const buttonPrimary = useThemeColor({}, "buttonPrimary");

  return (
    <ThemedView style={styles.tabContainer}>
      {tabs.map(tab => {
        const isActive = currentTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setCurrentTab(tab)}
            style={[styles.tab, isActive && { borderBottomColor: buttonPrimary }]}
          >
            <ThemedText
              style={[
                styles.tabText,
                isActive && (
                { color: buttonPrimary }),
              ]}
            >
              {tab}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
 
});
