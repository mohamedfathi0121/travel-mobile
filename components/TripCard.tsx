// ✅ TripCard.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

interface TripCardProps {
  title?: string;
  date?: string;
  image?: string;
  showReviewButton?: boolean;
  onReviewClick?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  title = "Untitled Trip",
  date = "Unknown Date",
  image,
  showReviewButton = false,
  onReviewClick,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const defaultImage = require("../assets/images/a.jpg");

  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.infoSection}>
        <ThemedText style={[styles.title, { color: theme.textPrimary }]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
          {date}
        </ThemedText>

        <TouchableOpacity
          onPress={showReviewButton ? onReviewClick : undefined}
          style={[
            styles.button,
            {
              backgroundColor: showReviewButton
                ? theme.buttonPrimary
                : theme.buttonPrimaryHover,
            },
          ]}
        >
          <ThemedText
            style={[styles.buttonText, { color: theme.buttonPrimaryText }]}
          >
            {showReviewButton ? "Review ⭐" : "Pay Now 💳"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <Image
        source={image ? { uri: image } : defaultImage}
        style={styles.image}
        resizeMode="cover"
      />
    </ThemedView>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    marginVertical: 6,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
