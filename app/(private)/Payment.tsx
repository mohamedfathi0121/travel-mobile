import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { ThemedView } from '@/components/ThemedView';

type BookingDetailsData = {
    id: string; 
    user_id: string;
    rooms: {
        single: number;
        double: number;
        triple: number;
    };
    attendees: {
        members: number;
    };
    trip_schedules: {
        id: string;
        price: { // We need the price per room
            price_single: number;
            price_double: number;
            price_triple: number;
        };
        base_trips: {
            title: string;
            photo_urls: string | string[];
        }
    }
};

export default function PaymentScreen() {
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    const [booking, setBooking] = useState<BookingDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);

    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];

    useEffect(() => {
        const bookingId = params.booking_id;
   console.log('Received Booking ID in Payment Screen:', bookingId);
        const fetchBookingDetails = async () => {
            if (!bookingId || typeof bookingId !== 'string') {
                Alert.alert("Error", "Booking ID is missing or invalid.");
                setIsLoading(false);
                return;
            }

            try {
                
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        user_id,
                        rooms,
                        attendees,
                        trip_schedules (
                            id,
                            price, 
                            base_trips (
                                title,
                                photo_urls
                            )
                        )
                    `)
                    .eq('id', bookingId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Booking not found.");
                
                const bookingData = data as unknown as BookingDetailsData;
                setBooking(bookingData);

                const { rooms, trip_schedules, attendees } = bookingData;
                const { price } = trip_schedules;
                
                const singleCost = (price.price_single || 0) * (rooms.single || 0);
                const doubleCost = (price.price_double || 0) * (rooms.double || 0);
                const tripleCost = (price.price_triple || 0) * (rooms.triple || 0);

                const total = singleCost + doubleCost + tripleCost;
                
                console.log("Calculating Price in Payment Screen:");
                console.log({ singleCost, doubleCost, tripleCost, total });

                setCalculatedTotalPrice(total);

            } catch (error: any) {
                console.error("Failed to fetch booking details:", error);
                Alert.alert("Error", `Could not load booking details: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [params.booking_id]);


    const handlePayment = async () => {
        if (!booking) {
            Alert.alert("Error", "Booking data is not available.");
            return;
        }
        
        setIsProcessingPayment(true);

        try {

            const payloadForFunction = {
                trip_schedule_id: booking.trip_schedules.id,
                user_id: booking.user_id,
                booking_info: {
                    singleRooms: booking.rooms.single,
                    doubleRooms: booking.rooms.double,
                    tripleRooms: booking.rooms.triple,
                    members: booking.attendees.members,
                }
            };

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: payloadForFunction,
            });

            if (error) throw new Error(error.message);
            if (data.url) {
                await WebBrowser.openBrowserAsync(data.url);
            } else {
                throw new Error("Could not retrieve payment URL.");
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            Alert.alert('Error', `Could not start the payment process: ${error.message}`);
        } finally {
            setIsProcessingPayment(false);
        }
    };
    
 const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 50, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
    backButton: { position: 'absolute', left: 0, zIndex: 1 },
    sectionTitle: { marginTop: 20, marginBottom: 10 },
    tripCard: { borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    tripImage: { width: 60, height: 60, borderRadius: 8 },
    tripName: { marginLeft: 15, flex: 1 },
    priceSection: { marginTop: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, marginVertical: 15 },
    payButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 'auto', backgroundColor: '#2563eb' },
    payButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={currentColors.buttonPrimary} />
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.centered}>
                <ThemedText>Booking not found.</ThemedText>
            </View>
        );
    }
    
    const tripTitle = booking.trip_schedules.base_trips.title;
    const photoUrls = booking.trip_schedules.base_trips.photo_urls;
    const imageUri = Array.isArray(photoUrls) && photoUrls.length > 0
        ? photoUrls[0]
        : 'https://placehold.co/60x60/EEE/31343C?text=...';

    return (
     <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
             <ThemedView style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color={currentColors.textPrimary} />
                 </TouchableOpacity>
                 <ThemedText type="title">Confirm Payment</ThemedText>
             </ThemedView>
 
             <ThemedText type="subtitle" style={styles.sectionTitle}>Your trip</ThemedText>
             <ThemedView style={styles.tripCard}>
                 <Image source={{ uri: imageUri }} style={styles.tripImage} />
                 <ThemedText type="defaultSemiBold" style={styles.tripName}>{tripTitle}</ThemedText>
             </ThemedView>
 
             <ThemedView style={styles.priceSection}>
                 <ThemedText type="subtitle" style={styles.sectionTitle}>Price summary</ThemedText>
  
                 <ThemedView style={styles.priceRow}>
                   <ThemedText type="default">Single Rooms ({booking.rooms.single})</ThemedText>
                   <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_single || 0) * booking.rooms.single}</ThemedText>
                 </ThemedView>
                 <ThemedView style={styles.priceRow}>
                   <ThemedText type="default">Double Rooms ({booking.rooms.double})</ThemedText>
                   <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_double || 0) * booking.rooms.double}</ThemedText>
                 </ThemedView>
                 <ThemedView style={styles.priceRow}>
                   <ThemedText type="default">Triple Rooms ({booking.rooms.triple})</ThemedText>
                   <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_triple || 0) * booking.rooms.triple}</ThemedText>
                 </ThemedView>

                 <ThemedView style={styles.divider} />

                 <ThemedView style={styles.priceRow}>
                   <ThemedText type="defaultSemiBold">Total</ThemedText>
                   <ThemedText type="defaultSemiBold">${calculatedTotalPrice}</ThemedText>
                 </ThemedView>
             </ThemedView>
             

             <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessingPayment}>
                 <ThemedText style={styles.payButtonText}>
                     {isProcessingPayment ? "Processing..." : `Pay $${calculatedTotalPrice}`}
                 </ThemedText>
             </TouchableOpacity>
        </ScrollView>
        </ThemedView>
     );
}