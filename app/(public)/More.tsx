import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function More() {
  const { signOut } = useAuth();
  const LogoutButton = useThemeColor({}, "buttonPrimary");
  const textColor = useThemeColor({}, "buttonPrimaryText");


  return (
    <ThemedView style={styles.screen}>
      {/* ✅ Header */}
      <ThemedText style={styles.subtitle}>
        ⚙️ Customize your experience
      </ThemedText>

      {/* ✅ Theme Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        <ThemeToggleButton />
      </View>


    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(200,200,200,0.1)", // light tint for casual look
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

});
