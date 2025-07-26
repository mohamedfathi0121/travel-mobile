import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

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
  const theme = Colors[colorScheme ?? "light"];

  const [tripInfo, setTripInfo] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingText, setEditingText] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);

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
    const existingReview = data.find((r) => r.user_id === user?.id) || null;
    setUserReview(existingReview);
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

  const handleDelete = async (reviewId: number) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) return Alert.alert("Delete error", error.message);
    setUserReview(null);
    fetchReviews(tripInfo.base_trips.id);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("reviews")
      .update({ rating: editingRating, review_text: editingText })
      .eq("id", editingId);
    if (error) return Alert.alert("Update error", error.message);
    setEditingId(null);
    fetchReviews(tripInfo.base_trips.id);
  };

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  const ratingCounts: Record<number, number> = {};
  reviews.forEach((r) => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText style={[styles.title, { color: theme.textPrimary }]}>
            {" "}
            {tripInfo?.base_trips?.title}{" "}
          </ThemedText>
          <ThemedText style={[styles.desc, { color: theme.textSecondary }]}>
            {" "}
            {tripInfo?.base_trips?.description}{" "}
          </ThemedText>
          {/* زر الرجوع */}
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/(private)/(tabs)/TripPage")}
          >
            <ThemedText style={{ color: theme.textPrimary }}>
              {"<- Back"}
            </ThemedText>
          </Pressable>
          {/* التقييم العام */}
          <ThemedView
            style={[
              styles.ratingSummary,
              { backgroundColor: theme.background, borderColor: theme.icon },
            ]}
          >
            <ThemedText
              style={[styles.rateTitle, { color: theme.textPrimary }]}
            >
              How was {tripInfo?.base_trips?.title}?
            </ThemedText>
            <ThemedView style={styles.ratingOverall}>
              <ThemedView
                style={[
                  { alignItems: "center" },
                  { backgroundColor: theme.background },
                ]}
              >
                <ThemedText
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: theme.textPrimary,
                  }}
                >
                  {averageRating.toFixed(1)}
                </ThemedText>
                <ThemedView style={{ flexDirection: "row", marginVertical: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <ThemedText key={i} style={{ fontSize: 20, color: "gold" }}>
                      {i < Math.round(averageRating) ? "★" : "☆"}
                    </ThemedText>
                  ))}
                </ThemedView>
                <ThemedText style={{ color: theme.textSecondary }}>
                  {reviews.length} reviews
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: 12 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const percent = reviews.length
                    ? Math.round((count / reviews.length) * 100)
                    : 0;
                  return (
                    <ThemedView key={star} style={styles.ratingRowBar}>
                      <ThemedText
                        style={{ width: 20, color: theme.textPrimary }}
                      >
                        {star}
                      </ThemedText>
                      <ThemedView
                        style={[
                          styles.barBackground,
                          { backgroundColor: theme.textHardSecondary },
                        ]}
                      >
                        <ThemedView
                          style={[
                            styles.barFill,
                            {
                              backgroundColor: theme.buttonPrimary,
                              width: `${percent}%`,
                            },
                          ]}
                        />
                      </ThemedView>
                      <ThemedText
                        style={{
                          width: 40,
                          textAlign: "right",
                          color: theme.textPrimary,
                        }}
                      >
                        {percent}%
                      </ThemedText>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* التقييمات الفردية */}
          {reviews.map((r) => (
            <ThemedView
              key={r.id}
              style={{
                borderWidth: 1,
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
              }}
            >
              <ThemedText
                style={{ color: theme.textPrimary, fontWeight: "bold" }}
              >
                {r.rating} ★
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary }}>
                {r.review_text}
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                {new Date(r.created_at).toLocaleDateString()}
              </ThemedText>
              {r.user_id === user?.id && (
                <ThemedView
                  style={{ flexDirection: "row", marginTop: 8, gap: 16 }}
                >
                  <Pressable
                    onPress={() => {
                      setEditingId(r.id);
                      setEditingRating(r.rating);
                      setEditingText(r.review_text);
                    }}
                  >
                    <ThemedText style={{ color: "blue" }}>Edit</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Delete",
                        "Do you want to delete your review?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => handleDelete(r.id),
                          },
                        ]
                      )
                    }
                  >
                    <ThemedText style={{ color: "red" }}>Delete</ThemedText>
                  </Pressable>
                </ThemedView>
              )}
              {editingId === r.id && (
                <ThemedView style={{ marginTop: 8 }}>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    style={{
                      borderWidth: 1,
                      color: theme.textPrimary,
                      padding: 8,
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                    multiline
                  />
                  <Pressable
                    onPress={handleUpdate}
                    style={{
                      backgroundColor: theme.buttonPrimary,
                      padding: 10,
                      borderRadius: 6,
                      alignItems: "center",
                    }}
                  >
                    <ThemedText style={{ color: theme.buttonPrimaryText }}>
                      Save
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              )}
            </ThemedView>
          ))}

          {/* إضافة تقييم لو مفيش تقييم خاص بالمستخدم */}
          {!userReview && (
            <>
              <ThemedText
                style={[styles.rateTitle, { color: theme.textPrimary }]}
              >
                Rate this trip:
              </ThemedText>
              <ThemedView style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setSelectedRating(n)}>
                    <Ionicons
                      name={selectedRating >= n ? "star" : "star-outline"}
                      size={28}
                      color="gold"
                    />
                  </Pressable>
                ))}
              </ThemedView>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.textSecondary,
                  },
                ]}
                placeholder="Write your review..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
              />
              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <ThemedText style={styles.submitText}>Submit</ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold" },
  desc: { marginBottom: 16 },
  ratingSummary: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  ratingOverall: {
    flexDirection: "row",
    marginTop: 12,
  },
  ratingRowBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
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
    marginBottom: 40,
  },
  backBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    alignItems: "center",
    borderRadius: 6,
    marginBottom: 10,
    width: "25%",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  rateTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16 },
});
