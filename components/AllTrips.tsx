import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

interface Trip {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  available_tickets: number;
  sold_tickits: number;
  price: {
    price_single: number;
    price_double: number;
    price_triple: number;
  };
  base_trips: {
    title: string;
    description: string;
    city: string;
    country: string;
    photo_urls: string[];
  };
}

export default function AllTripsScreen() {
  const backgroundColor = useThemeColor({}, "background");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trip_schedules")
        .select("*, base_trips(*)");

      if (error) {
        console.error("Supabase fetch error:", error);
        setLoading(false);
        return;
      }

      const today = new Date();
      const upcomingTrips = data.filter(
        (trip: Trip) => new Date(trip.end_date) >= today
      );

      setTrips(upcomingTrips);
      setFilteredTrips(upcomingTrips);
      setLoading(false);
    };

    fetchTrips();
  }, []);

  const handleFilter = () => {
    let result = [...trips];

    if (city) {
      result = result.filter(trip =>
        trip.base_trips.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (country) {
      result = result.filter(trip =>
        trip.base_trips.country.toLowerCase().includes(country.toLowerCase())
      );
    }

    if (price) {
      const max = Number(price);
      result = result.filter(
        trip =>
          trip.price?.price_single <= max ||
          trip.price?.price_double <= max ||
          trip.price?.price_triple <= max
      );
    }

    setFilteredTrips(result);
  };
  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* Cards */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : filteredTrips.length > 0 ? (
          filteredTrips.map(trip => {
            const remainingTickets = trip.available_tickets - trip.sold_tickits;

            return (
              <Pressable
                key={trip.id}
                onPress={() => router.push(`/tripdetails/${trip.id}`)}
              >
                <View key={trip.id} style={styles.card}>
                  {trip.base_trips?.photo_urls?.[0] ? (
                    <Image
                      source={{ uri: trip.base_trips.photo_urls[0] }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <ThemedText>No Image</ThemedText>
                    </View>
                  )}

                  <ThemedText type="defaultSemiBold" style={styles.title}>
                    {trip.base_trips.title}
                  </ThemedText>
                  <ThemedText>{trip.base_trips.description}</ThemedText>
                  <ThemedText>City: {trip.base_trips.city}</ThemedText>
                  <ThemedText>Country: {trip.base_trips.country}</ThemedText>
                  <ThemedText>
                    <ThemedText>Status: </ThemedText>
                    <ThemedText
                      style={{
                        color: trip.status === "open" ? "green" : "red",
                      }}
                    >
                      {trip.status}
                    </ThemedText>
                  </ThemedText>
                  <ThemedText>
                    Remaining Tickets: {remainingTickets} /{" "}
                    {trip.available_tickets}
                  </ThemedText>
                  <ThemedText>
                    Price: Single ${trip.price?.price_single}, Double $
                    {trip.price?.price_double}, Triple $
                    {trip.price?.price_triple}
                  </ThemedText>
                  <ThemedText style={styles.dateText}>
                    Start: {new Date(trip.start_date).toLocaleDateString()} |
                    End: {new Date(trip.end_date).toLocaleDateString()}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })
        ) : (
          <ThemedText style={styles.emptyText}>No trips found.</ThemedText>
        )}
      </View>
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
    fontSize: 22,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 24,
    gap: 12,
  },
  input: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  filterButton: {
    color: "#1E90FF",
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    borderColor: "#fff",
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
