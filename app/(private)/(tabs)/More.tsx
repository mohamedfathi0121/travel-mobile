import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function More() {



  return (
    <View>
      <ThemeToggleButton />
      <Text>More Options</Text>
      <Button title="Logout"  />
    </View>
  );
}
