import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router"; // ⬅️ الاستيراد الصحيح
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme } from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import TripCard from "../../../components/TripCard";
import TripTabs from "../../../components/TripTabs";

interface Trip {
  id: string;
  title: string;
  date: string;
  status: string;
  image: string;
}

const TripPage = () => {
  const router = useRouter(); // ⬅️ تعريف router
  const navigation = useNavigation();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTab, setCurrentTab] = useState("Approved");

  const theme = useColorScheme();
  const isDark = theme === "dark";

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) return;

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          trip_schedules (
            id,
            start_date,
            end_date,
            status,
            location_url,
            base_trips (
              id,
              title,
              description,
              photo_urls,
              city
            )
          )
        `
        )
        .eq("user_id", user.id);

      if (error) return console.error(error);

      const today = new Date();

      const mapped = bookings.map((b: any) => {
        const trip = b.trip_schedules;
        const base = trip.base_trips;
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);

        let status = "Not Approved";
        if (trip.status === "cancelled") status = "Cancelled";
        else if (
          (trip.status === "open" || trip.status === "closed") &&
          end < today
        )
          status = "Completed";
        else if (trip.status === "open" && start > today) status = "Approved";
        else if (trip.status === "full") status = "Not Approved";

        const startFormatted = formatDateTime(trip.start_date);
        const endFormatted = formatDateTime(trip.end_date);

        return {
          id: trip.id,
          title: base?.title || "Untitled",
          date: `${startFormatted.date} at ${startFormatted.time}\n→ ${endFormatted.date} at ${endFormatted.time}`,
          image: base?.photo_urls?.[0] || "",
          status,
        };
      });

      setTrips(mapped);
    };

    fetchTrips();
  }, [user?.id]);

  const filteredTrips = trips.filter((t) => t.status === currentTab);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#111" : "#fff" }]}
    >
      <Text style={[styles.heading, { color: isDark ? "#fff" : "#000" }]}>
        My Trips
      </Text>
      <TripTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      {filteredTrips.length > 0 ? (
        filteredTrips.map((trip) => (
          <TripCard
            key={trip.id}
            title={trip.title}
            date={trip.date}
            image={trip.image}
            showReviewButton={currentTab === "Completed"}
            onReviewClick={() => router.push(`/TripInfo?id=${trip.id}`)}
          />
        ))
      ) : (
        <Text style={{ color: isDark ? "#aaa" : "#000" }}>
          No {currentTab.toLowerCase()} trips found.
        </Text>
      )}
    </ScrollView>
  );
};

export default TripPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
