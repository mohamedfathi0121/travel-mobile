import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { ThemedView } from "@/components/ThemedView";

export default function More() {



  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemeToggleButton />

    </ThemedView>
  );
}
