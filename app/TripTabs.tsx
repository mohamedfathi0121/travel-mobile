import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const tabs = ["Approved", "Completed", "Cancelled", "Not Approved"];

interface TripTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const TripTabs: React.FC<TripTabsProps> = ({ currentTab, setCurrentTab }) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab === currentTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              isActive && { borderColor: isDark ? "#fff" : "#000" },
            ]}
            onPress={() => setCurrentTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isDark ? "#aaa" : "#888" },
                isActive && {
                  color: isDark ? "#fff" : "#000",
                  fontWeight: "600",
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
