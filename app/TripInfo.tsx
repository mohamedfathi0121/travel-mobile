""; // app/TripInfo.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export default function TripInfo() {
  const { user } = useAuth();
  const router = useRouter();
  const { id: tripScheduleId } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  const [tripInfo, setTripInfo] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("trip_schedules")
        .select(`*, base_trips(*)`)
        .eq("id", tripScheduleId)
        .maybeSingle();
      if (error) return console.error(error);
      setTripInfo(data);
      if (data?.base_trips?.id) fetchReviews(data.base_trips.id);
    };
    fetchData();
  }, [tripScheduleId]);

  const fetchReviews = async (baseTripId: number) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("base_trip_id", baseTripId);
    if (error) return console.error(error);
    setReviews(data);
  };

  const handleSubmit = async () => {
    if (!user?.id) return Alert.alert("Login required");
    if (selectedRating === 0) return Alert.alert("Choose rating");
    const { error } = await supabase.from("reviews").insert({
      base_trip_id: tripInfo.base_trips.id,
      rating: selectedRating,
      review_text: reviewText,
      user_id: user.id,
    });
    if (error) return Alert.alert("Submit error", error.message);
    setSelectedRating(0);
    setReviewText("");
    fetchReviews(tripInfo.base_trips.id);
  };

  const theme = {
    background: isDark ? "#111" : "#fff",
    text: isDark ? "#eee" : "#111",
    border: isDark ? "#444" : "#ccc",
    card: isDark ? "#222" : "#f9f9f9",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Pressable
        style={styles.back}
        onPress={() => router.replace("/TripPage")}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <Text style={{ color: theme.text }}>Back</Text>
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>
        {tripInfo?.base_trips?.title}
      </Text>
      <Text style={[styles.desc, { color: theme.text }]}>
        {tripInfo?.base_trips?.description}
      </Text>

      {/* Reviews List */}
      {reviews.map((r) => (
        <View
          key={r.id}
          style={[
            styles.reviewCard,
            { borderColor: theme.border, backgroundColor: theme.card },
          ]}
        >
          <View style={styles.reviewHeader}>
            <Text style={{ color: theme.text }}>{r.rating} ★</Text>
            <Text style={{ color: theme.text }}>
              {new Date(r.created_at).toLocaleDateString()}
            </Text>
            {r.user_id === user?.id && (
              <Pressable
                onPress={() => {
                  setEditingId(r.id);
                  setEditingRating(r.rating);
                  setEditingText(r.review_text);
                }}
              >
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
            )}
          </View>
          <Text style={{ color: theme.text }}>{r.review_text}</Text>

          {/* Edit Mode */}
          {editingId === r.id && (
            <View style={styles.editForm}>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={editingText}
                onChangeText={setEditingText}
                placeholderTextColor={isDark ? "#888" : "#aaa"}
              />
              <Pressable
                onPress={async () => {
                  await supabase
                    .from("reviews")
                    .update({ rating: editingRating, review_text: editingText })
                    .eq("id", r.id);
                  setEditingId(null);
                  fetchReviews(tripInfo.base_trips.id);
                }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}

      {/* Add Review */}
      <Text style={[styles.rateTitle, { color: theme.text }]}>
        Rate this trip:
      </Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setSelectedRating(n)}>
            <Ionicons
              name={selectedRating >= n ? "star" : "star-outline"}
              size={28}
              color={theme.text}
            />
          </Pressable>
        ))}
      </View>
      <TextInput
        style={[
          styles.textArea,
          { color: theme.text, borderColor: theme.border },
        ]}
        placeholder="Write your review..."
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        placeholderTextColor={isDark ? "#888" : "#aaa"}
      />
      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  back: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  desc: { marginBottom: 16 },
  reviewCard: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between" },
  edit: { color: "blue" },
  editForm: { marginTop: 8 },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: "#28a745",
    padding: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  saveText: { color: "#fff" },
  rateTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16 },
  ratingRow: { flexDirection: "row", marginVertical: 8, gap: 4 },
  textArea: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    height: 80,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
