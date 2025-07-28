import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

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
      router.push(`/(private)/trip/${id}`);
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
    <ThemedView style={[styles.card,{borderColor: "#ffffff", borderWidth: 1}]}>
      <View style={styles.infoContainer}>
        <ThemedText >{title}</ThemedText>
        <ThemedText style={styles.date}>{date}</ThemedText>

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
    </ThemedView>
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

  },
  date: {
    fontSize: 14,

    marginBottom: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  reviewButton: {
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
  },
  ticketButton: {
    backgroundColor: "#2563eb",
        justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
        justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
});
