import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const tabs = ["On Going", "Completed"];

interface TripTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function TripTabs({ currentTab, setCurrentTab }: TripTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setCurrentTab(tab)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, isActive && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2563eb",
  },
});
