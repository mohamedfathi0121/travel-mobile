import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TripCard from "@/components/TripCard";
import TripTabs from "@/components/TripTabs";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

interface Trip {
  id: string;
  title: string;
  date: string;
  image: string;
  status: "On Going" | "Completed";
  ticketId?: string;
}

export default function TripPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTab, setCurrentTab] = useState<"On Going" | "Completed">(
    "On Going"
  );
const backgroundColor = useThemeColor({}, "background");
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
          ticket_id,
          trip_schedules (
            id,
            start_date,
            end_date,
            base_trips (
              id,
              title,
              photo_urls
            )
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching bookings:", error.message);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mappedTrips: Trip[] = bookings
        .filter((b: any) => b.trip_schedules)
        .map((booking: any) => {
          const trip = booking.trip_schedules;
          const baseTrip = trip?.base_trips;

          const endDate = new Date(trip?.end_date);
          endDate.setHours(0, 0, 0, 0);

          const status: "On Going" | "Completed" =
            endDate < today ? "Completed" : "On Going";

          const startFormatted = formatDateTime(trip.start_date);
          const endFormatted = formatDateTime(trip.end_date);

          return {
            id: trip.id,
            status,
            title: baseTrip?.title || "Untitled",
            date: `${startFormatted.date} at ${startFormatted.time}\n→ ${endFormatted.date} at ${endFormatted.time}`,
            image: baseTrip?.photo_urls?.[0] || "",
            ticketId: booking.ticket_id || undefined,
          };
        });

      setTrips(mappedTrips);
    };

    fetchTrips();
  }, [user?.id]);

  const filteredTrips = trips.filter(trip => trip.status === currentTab);

  return (
      <ScrollView contentContainerStyle={styles.scrollContent} style={{ backgroundColor: backgroundColor }}>
    <ThemedView style={styles.container}>
        <TripTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {filteredTrips.length > 0 ? (
          filteredTrips.map(trip => (
            <TripCard
              key={trip.id}
              title={trip.title}
              date={trip.date}
              image={trip.image}
              showReviewButton={currentTab === "Completed"}
              id={trip.id}
              ticketId={trip.ticketId}
            />
          ))
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.emptyText}>
            No {currentTab.toLowerCase()} trips found.
          </ThemedText>
        )}
    </ThemedView>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
  tabsContainer: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
});
