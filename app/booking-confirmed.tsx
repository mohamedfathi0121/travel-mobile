import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '../lib/supabase';


type LiveBookingData = {
    id: string;
    ticket_id: string;
    total_price: { amount: number };
    attendees: { members: number };
    rooms: { single?: number; double?: number; triple?: number }; 
    trip_schedules: {
        id: string;
    
        base_trips: {
            title: string;
            photo_urls: string | string[];
        }
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

    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];

    useEffect(() => {
        const bookingId = params.booking_id || '00361dd9-9d7a-408c-98df-50187b5549ca'; 

        const fetchBookingDetails = async () => {
            if (!bookingId || typeof bookingId !== 'string' || bookingId.includes('PASTE')) {
                setIsLoading(false);
                return;
            }

            try {
                // Step 1: Fetch the booking to get the trip_schedule_id and user_id.
                const { data: bookingData, error: bookingError } = await supabase
                    .from('bookings')
                    .select('*, trip_schedule_id, user_id')
                    .eq('id', bookingId)
                    .single();

                if (bookingError) throw bookingError;
                if (!bookingData) throw new Error("Booking not found.");

                const scheduleId = bookingData.trip_schedule_id;
                const profileId = bookingData.user_id;

                const { data: scheduleData, error: scheduleError } = await supabase
                    .from('trip_schedules')
                    .select('*, base_trip_id')
                    .eq('id', scheduleId)
                    .single();
                
                if (scheduleError) throw scheduleError;
                if (!scheduleData) throw new Error("Trip schedule not found.");

                const baseTripId = scheduleData.base_trip_id;

                const [tripResponse, profileResponse] = await Promise.all([
                    supabase.from('base_trips').select('*').eq('id', baseTripId).single(),
                    supabase.from('profiles').select('*').eq('id', profileId).single()
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
                Alert.alert("Database Error", `Failed to fetch data. Details: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [params.booking_id]);

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: currentColors.background },
        contentContainer: { padding: 20, paddingBottom: 50, flexGrow: 1 },
        header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        backButton: { zIndex: 1 },
        confirmationHeader: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
        confirmationSubtitle: { color: currentColors.textSecondary, textAlign: 'center', marginTop: 8 },
        destinationCard: { backgroundColor: currentColors.background, borderRadius: 16, marginBottom: 30, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
        destinationImage: { width: '100%', height: 200, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#eee' },
        cardTextContainer: { padding: 15 },
        destinationTitle: { paddingBottom: 5, },
        destinationDetails: { paddingTop: 5, color: currentColors.textSecondary, },
        destinationPrice: { paddingTop: 15, fontSize: 18, },
        detailsSection: { marginBottom: 30 },
        detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: currentColors.input },
        qrCodeContainer: { alignItems: 'center' },
        qrTitle: { marginBottom: 15 },
        qrCodeBox: { backgroundColor: currentColors.background, padding: 20, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={currentColors.buttonPrimary} />
                <ThemedText style={{marginTop: 10}}>Confirming your booking...</ThemedText>
            </View>
        );
    }

    if (!liveBooking) {
        return (
            <View style={styles.centered}>
                <ThemedText>Could not find booking details.</ThemedText>
                <ThemedText style={{color: currentColors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 20}}>
                    Please make sure you have pasted a valid booking ID for testing.
                </ThemedText>
            </View>
        );
    }
    
    const confirmationNumber = liveBooking.ticket_id || liveBooking.id;
    
    const imageUri = Array.isArray(liveBooking.trip_schedules?.base_trips?.photo_urls) 
        ? liveBooking.trip_schedules.base_trips.photo_urls[0] 
        : liveBooking.trip_schedules?.base_trips?.photo_urls || 'https://placehold.co/600x400/EEE/31343C?text=Image+Not+Available';

    // This function now safely checks for each room type.
    const getRoomDetailsString = () => {
        if (!liveBooking.rooms) return "N/A";
        
        const roomParts = [];
        // ✅ FIX: Check if the room count exists and is greater than 0.
        if (liveBooking.rooms.single) {
            roomParts.push(`${liveBooking.rooms.single} Single`);
        }
        if (liveBooking.rooms.double) {
            roomParts.push(`${liveBooking.rooms.double} Double`);
        }
        if (liveBooking.rooms.triple) {
            roomParts.push(`${liveBooking.rooms.triple} Triple`);
        }
        
        return roomParts.length > 0 ? roomParts.join(', ') : "No rooms selected";
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color={currentColors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.confirmationHeader}>
                <ThemedText type="title" style={{textAlign: 'center'}}>Your trip is confirmed, {liveBooking.profiles?.display_name || 'there'}!</ThemedText>
                <ThemedText style={styles.confirmationSubtitle}>
                    Thank you for booking with Wanderlust Travel. Your trip details are below.
                </ThemedText>
            </View>
            
            <View style={styles.destinationCard}>
                <Image source={{ uri: imageUri }} style={styles.destinationImage} />
                <View style={styles.cardTextContainer}>
                    <ThemedText type="subtitle" style={styles.destinationTitle}>{liveBooking.trip_schedules?.base_trips?.title}</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.destinationDetails}>
                        Oct 28 - Dec 30 • {liveBooking.attendees.members} Guests
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.destinationPrice}>
                        Total: ${liveBooking.total_price.amount}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.detailsSection}>
                <ThemedText type="subtitle">Booking Details</ThemedText>
                <View style={styles.detailRow}>
                    <ThemedText type="default">Confirmation Number</ThemedText>
                    <ThemedText type="defaultSemiBold">{confirmationNumber}</ThemedText>
                </View>
                 <View style={styles.detailRow}>
                    <ThemedText type="default">Total Members</ThemedText>
                    <ThemedText type="defaultSemiBold">{liveBooking.attendees.members}</ThemedText>
                </View>
                 <View style={styles.detailRow}>
                    <ThemedText type="default">Rooms</ThemedText>
                    <ThemedText type="defaultSemiBold">{getRoomDetailsString()}</ThemedText>
                </View>
            </View>

            <View style={styles.qrCodeContainer}>
                <ThemedText type="subtitle" style={styles.qrTitle}>QR Code</ThemedText>
                <View style={styles.qrCodeBox}>
                   <QRCode
                        value={confirmationNumber}
                        size={180}
                        backgroundColor={currentColors.background}
                        color={currentColors.textPrimary}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
