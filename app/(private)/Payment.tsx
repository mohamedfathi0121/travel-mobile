import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';

// The data structure this screen expects to receive
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
        price: {
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
    const background = useThemeColor({ }, 'background');
    

    const [booking, setBooking] = useState<BookingDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);

    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];

    useEffect(() => {
        const bookingDataString = params.bookingData;
        
        if (bookingDataString && typeof bookingDataString === 'string') {
            try {
                // Parse the data object passed from the previous screen
                const bookingDataObject = JSON.parse(bookingDataString);
                setBooking(bookingDataObject as BookingDetailsData);

                // Calculate total price from the received data
                const { rooms, trip_schedules } = bookingDataObject;
                const total = (trip_schedules.price.price_single || 0) * (rooms.single || 0) +
                              (trip_schedules.price.price_double || 0) * (rooms.double || 0) +
                              (trip_schedules.price.price_triple || 0) * (rooms.triple || 0);
                setCalculatedTotalPrice(total);

            } catch (e) {
                console.error("Failed to parse booking data from params:", e);
                Alert.alert("Error", "Could not process booking details.");
            }
        } else {
            Alert.alert("Error", "Booking details were not provided.");
        }
        setIsLoading(false);
    }, [params.bookingData]);

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
    
    if (isLoading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </ThemedView>
        );
    }

    if (!booking) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Booking details not found.</ThemedText>
            </ThemedView>
        );
    }
    
    const tripTitle = booking.trip_schedules.base_trips.title;
    const photoUrls = booking.trip_schedules.base_trips.photo_urls;
    const imageUri = Array.isArray(photoUrls) && photoUrls.length > 0
        ? photoUrls[0]
        : 'https://placehold.co/60x60/EEE/31343C?text=...';

    return (
     <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
           <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <ThemedView style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24}  />
                    </TouchableOpacity>
                    <ThemedText type="title">Confirm Payment</ThemedText>
                </ThemedView>

                <ThemedText type="subtitle" style={styles.sectionTitle}>Your trip</ThemedText>
                <ThemedView style={[styles.tripCard, ]}>
                    <Image source={{ uri: imageUri }} style={styles.tripImage} />
                    <ThemedText type="defaultSemiBold" style={styles.tripName}>{tripTitle}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.priceSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Price summary</ThemedText>

                    {booking.rooms.single > 0 && (
                        <ThemedView style={styles.priceRow}>
                            <ThemedText>Single Rooms ({booking.rooms.single})</ThemedText>
                            <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_single || 0) * booking.rooms.single}</ThemedText>
                        </ThemedView>
                    )}
                    {booking.rooms.double > 0 && (
                        <ThemedView style={styles.priceRow}>
                            <ThemedText>Double Rooms ({booking.rooms.double})</ThemedText>
                            <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_double || 0) * booking.rooms.double}</ThemedText>
                        </ThemedView>
                    )}
                    {booking.rooms.triple > 0 && (
                        <ThemedView style={styles.priceRow}>
                            <ThemedText>Triple Rooms ({booking.rooms.triple})</ThemedText>
                            <ThemedText type="defaultSemiBold">${(booking.trip_schedules.price.price_triple || 0) * booking.rooms.triple}</ThemedText>
                        </ThemedView>
                    )}

                    <View style={[styles.divider, ]} />

                    <ThemedView style={styles.priceRow}>
                        <ThemedText type="subtitle">Total</ThemedText>
                        <ThemedText type="subtitle">${calculatedTotalPrice}</ThemedText>
                    </ThemedView>
                </ThemedView>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.payButton, { opacity: isProcessingPayment ? 0.7 : 1 }]} onPress={handlePayment} disabled={isProcessingPayment}>
                    {isProcessingPayment ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.payButtonText}>
                            Pay ${calculatedTotalPrice}
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 20 },
    header: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20,  },
    backButton: { position: 'absolute', left: 0, zIndex: 1, padding: 5 },
    sectionTitle: { marginTop: 20, marginBottom: 15 },
    tripCard: { borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center' },
    tripImage: { width: 60, height: 60, borderRadius: 8 },
    tripName: { marginLeft: 15, flex: 1, fontSize: 16 },
    priceSection: { marginTop: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    divider: { height: 1, marginVertical: 15 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    payButton: { padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#2563eb' },
    payButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});