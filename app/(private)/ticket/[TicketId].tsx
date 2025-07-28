import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

type LiveBookingData = {
  id: string;
  ticket_id: string;
  total_price: { amount: number; currency: string };
  attendees: { members: number };
  rooms: { single?: number; double?: number; triple?: number };
  trip_schedules: {
    id: string;
    base_trips: {
      title: string;
      photo_urls: string | string[];
    };
  };
  profiles: {
    display_name: string;
  };
  [key: string]: any;
};

export default function BookingConfirmedScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const [liveBooking, setLiveBooking] = useState<LiveBookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bookingId = params.TicketId || "00361dd9-9d7a-408c-98df-50187b5549ca";

    const fetchBookingDetails = async () => {
      if (
        !bookingId ||
        typeof bookingId !== "string" ||
        bookingId.includes("PASTE")
      ) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*, trip_schedule_id, user_id")
          .eq("ticket_id", bookingId)
          .single();

        if (bookingError) throw bookingError;
        if (!bookingData) throw new Error("Booking not found.");

        const scheduleId = bookingData.trip_schedule_id;
        const profileId = bookingData.user_id;

        const { data: scheduleData, error: scheduleError } = await supabase
          .from("trip_schedules")
          .select("*, base_trip_id")
          .eq("id", scheduleId)
          .single();

        if (scheduleError) throw scheduleError;
        if (!scheduleData) throw new Error("Trip schedule not found.");

        const baseTripId = scheduleData.base_trip_id;

        const [tripResponse, profileResponse] = await Promise.all([
          supabase.from("base_trips").select("*").eq("id", baseTripId).single(),
          supabase.from("profiles").select("*").eq("id", profileId).single(),
        ]);

        if (tripResponse.error) throw tripResponse.error;
        if (profileResponse.error) throw profileResponse.error;

        const combinedData = {
          ...bookingData,
          trip_schedules: {
            ...scheduleData,
            base_trips: tripResponse.data,
          },
          profiles: profileResponse.data,
        };

        setLiveBooking(combinedData as LiveBookingData);
      } catch (error: any) {
        console.error("Failed to fetch booking details:", error.message);
        Alert.alert(
          "Database Error",
          `Failed to fetch data. Details: ${error.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params.booking_id]);

  const getRoomDetailsString = () => {
    if (!liveBooking?.rooms) return "N/A";

    const roomParts = [];
    if (liveBooking.rooms.single) {
      roomParts.push(`${liveBooking.rooms.single} Single`);
    }
    if (liveBooking.rooms.double) {
      roomParts.push(`${liveBooking.rooms.double} Double`);
    }
    if (liveBooking.rooms.triple) {
      roomParts.push(`${liveBooking.rooms.triple} Triple`);
    }

    return roomParts.length > 0 ? roomParts.join(", ") : "No rooms selected";
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>
          Confirming your booking...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!liveBooking) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Could not find booking details.</ThemedText>
        <ThemedText
          type="default"
          style={{
            marginTop: 8,
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          Please make sure you have pasted a valid booking ID for testing.
        </ThemedText>
      </ThemedView>
    );
  }

  const confirmationNumber = liveBooking.ticket_id || liveBooking.id;

  const imageUri = Array.isArray(
    liveBooking.trip_schedules?.base_trips?.photo_urls
  )
    ? liveBooking.trip_schedules.base_trips.photo_urls[0]
    : liveBooking.trip_schedules?.base_trips?.photo_urls ||
      "https://placehold.co/600x400/EEE/31343C?text=Image+Not+Available";

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.confirmationHeader}>
            <ThemedText type="title" style={{ textAlign: "center" }}>
              Your trip is confirmed,{" "}
              {liveBooking.profiles?.display_name || "there"}!
            </ThemedText>
            <ThemedText type="default" style={styles.confirmationSubtitle}>
              Thank you for booking with AdventureCo. Your trip details are
              below.
            </ThemedText>
          </View>

          <ThemedView style={styles.destinationCard}>
            <Image source={{ uri: imageUri }} style={styles.destinationImage} />
            <View style={styles.cardTextContainer}>
              <ThemedText type="subtitle" style={styles.destinationTitle}>
                {liveBooking.trip_schedules?.base_trips?.title}
              </ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={styles.destinationDetails}
              >
                Oct 28 - Dec 30 • {liveBooking.attendees.members} Guests
              </ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={styles.destinationPrice}
              >
                Total: {liveBooking.total_price.currency}{" "}
                {liveBooking.total_price.amount}
              </ThemedText>
            </View>
          </ThemedView>

          <View style={styles.detailsSection}>
            <ThemedText type="subtitle">Booking Details</ThemedText>
            <View style={[styles.detailRow, { flexDirection: "column" }]}>
              <ThemedText type="default">Confirmation Number:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {confirmationNumber}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText type="default">Total Members</ThemedText>
              <ThemedText type="defaultSemiBold">
                {liveBooking.attendees.members}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText type="default">Rooms</ThemedText>
              <ThemedText type="defaultSemiBold">
                {getRoomDetailsString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.qrCodeContainer}>
            <ThemedText type="subtitle" style={styles.qrTitle}>
              QR Code
            </ThemedText>
            <ThemedView style={[styles.qrCodeBox, { padding: 30 }]}>
              
              <QRCode value={confirmationNumber} size={180} />
            </ThemedView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    zIndex: 1,
  },
  confirmationHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  confirmationSubtitle: {
    textAlign: "center",
    marginTop: 8,
  },
  destinationCard: {
    borderRadius: 16,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  destinationImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#eee",
  },
  cardTextContainer: {
    padding: 15,
  },
  destinationTitle: {
    paddingBottom: 5,
  },
  destinationDetails: {
    paddingTop: 5,
  },
  destinationPrice: {
    paddingTop: 15,
    fontSize: 18,
  },
  detailsSection: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  qrCodeContainer: {
    alignItems: "center",
  },
  qrTitle: {
    marginBottom: 15,
  },
  qrCodeBox: {
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
