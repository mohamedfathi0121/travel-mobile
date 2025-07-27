import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface TripCardProps {
  title?: string;
  date?: string;
  image?: string;
  showReviewButton?: boolean;
  id: string; // Trip schedule ID
  ticketId?: string;
}

export default function TripCard({
  title = "Untitled Trip",
  date = "Unknown Date",
  image,
  showReviewButton = false,
  id,
  ticketId,
}: TripCardProps) {
  const router = useRouter();
  const defaultImage = require("../assets/images/a.jpg"); // ✅ Use require for local images

  const handlePress = () => {
    if (showReviewButton) {
      router.push(`/Trip/${id}`);
    } else if (ticketId) {
      router.push(`/(private)/ticket/${ticketId}`);
    }
  };

  const buttonText = showReviewButton
    ? "Review ⭐"
    : ticketId
    ? "Ticket 🎫"
    : "No Ticket";

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>

        <TouchableOpacity
          style={[
            styles.button,
            showReviewButton
              ? styles.reviewButton
              : ticketId
              ? styles.ticketButton
              : styles.disabledButton,
          ]}
          disabled={!showReviewButton && !ticketId}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={image ? { uri: image } : defaultImage}
        style={styles.image}
        resizeMode="cover"
        onError={() => (image = defaultImage as unknown as string)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  reviewButton: {
    backgroundColor: "#16a34a",
  },
  ticketButton: {
    backgroundColor: "#2563eb",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
});
