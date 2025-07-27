// ✅ TripCard.tsx (Dark/Light Theme)
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const isDark = colorScheme === "dark";
  const defaultImage = require("../assets/images/a.jpg"); // Default image path

  return (
    <View
      style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#fff" }]}
    >
      <View style={styles.infoSection}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#222" }]}>
          {title}
        </Text>
        <Text style={[styles.date, { color: isDark ? "#ccc" : "#666" }]}>
          {date}
        </Text>

        <TouchableOpacity
          onPress={showReviewButton ? onReviewClick : undefined}
          style={[
            styles.button,
            showReviewButton ? styles.reviewBtn : styles.payBtn,
          ]}
        >
          <Text style={styles.buttonText}>
            {showReviewButton ? "Review ⭐" : "Ticket 📜"}
          </Text>
        </TouchableOpacity>
      </View>
      <Image
        source={image ? { uri: image } : defaultImage}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
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
  reviewBtn: {
    backgroundColor: "#16a34a",
  },
  payBtn: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
