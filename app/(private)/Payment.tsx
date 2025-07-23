import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity, ScrollView, Switch, Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';

type TripData = {
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
};

type PaymentMethod = 'credit-card' | 'paypal';

export default function PaymentScreen() {
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    const [trip, setTrip] = useState<TripData | null>(null);
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
    const [saveCard, setSaveCard] = useState<boolean>(false);
    const [isBooking, setIsBooking] = useState(false);

    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];

    useEffect(() => {
        const tripScheduleId = params.trip_id || '06a300df-6889-4d31-b21a-cd63508e8ce9'; 

        const fetchTripDetails = async () => {
            if (!tripScheduleId) {
                Alert.alert("Error", "Trip ID is missing.");
                setIsLoadingTrip(false);
                return;
            }

            try {
                
                const { data: scheduleData, error: scheduleError } = await supabase
                    .from('trip_schedules')
                    .select('*, base_trip_id')
                    .eq('id', tripScheduleId)
                    .single();
                
                if (scheduleError) throw scheduleError;
                if (!scheduleData) throw new Error("Trip schedule not found.");

                const baseTripId = scheduleData.base_trip_id;

                const { data: baseTripData, error: baseTripError } = await supabase
                    .from('base_trips')
                    .select('*')
                    .eq('id', baseTripId)
                    .single();

                if (baseTripError) throw baseTripError;
                if (!baseTripData) throw new Error("Base trip not found.");

                const combinedData = {
                    ...scheduleData,
                    base_trips: baseTripData, 
                };

                setTrip(combinedData as TripData);

            } catch (error: any) {
                console.error("Failed to fetch trip details:", error);
                Alert.alert("Error", `Could not load trip details: ${error.message}`);
            } finally {
                setIsLoadingTrip(false);
            }
        };

        fetchTripDetails();
    }, [params.trip_id]);


    const handlePayment = async () => {
        if (!trip) {
            Alert.alert("Error", "Trip data is not available.");
            return;
        }
        
        const testUserId = 'bfb39f6b-b563-4ed2-974b-af30f1a53d76'; // For testing
        setIsBooking(true);

        try {
            const bookingDetails = {
                trip_schedule_id: trip.id,
                user_id: testUserId,
                booking_info: {
                    singleRooms: 1, doubleRooms: 0, tripleRooms: 0, members: 1,
                }
            };

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: bookingDetails,
            });

            if (error) throw new Error(error.message);
            if (data.url) await WebBrowser.openBrowserAsync(data.url);
            else throw new Error("Could not retrieve payment URL.");

        } catch (error: any) {
            console.error("Payment Error:", error);
            Alert.alert('Error', `Could not start the payment process: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };
    
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: currentColors.background },
        contentContainer: { padding: 20, paddingBottom: 50, flexGrow: 1 },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
        backButton: { position: 'absolute', left: 0, zIndex: 1 },
        sectionTitle: { marginTop: 20, marginBottom: 10 },
        tripCard: { backgroundColor: currentColors.input, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        tripImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
        tripName: { marginLeft: 15, flex: 1 },
        priceSection: { marginTop: 10 },
        priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
        divider: { height: 1, backgroundColor: currentColors.input, marginVertical: 15 },
        paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: currentColors.input, borderRadius: 12, marginBottom: 10 },
        selectedOption: { borderColor: currentColors.buttonPrimary, borderWidth: 1.5 },
        paymentText: { flex: 1, marginLeft: 15, fontSize: 16 },
        form: { marginTop: 20 },
        input: { backgroundColor: currentColors.input, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, color: currentColors.textPrimary, marginBottom: 10 },
        inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
        inputHalf: { width: '48%' },
        saveCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
        payButton: { backgroundColor: currentColors.buttonPrimary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 'auto', opacity: isBooking ? 0.7 : 1 },
        payButtonText: { color: currentColors.buttonPrimaryText, fontSize: 18, fontWeight: 'bold' },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
    });

    if (isLoadingTrip) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={currentColors.buttonPrimary} />
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={styles.centered}>
                <ThemedText>Trip not found.</ThemedText>
            </View>
        );
    }
    
    const totalPrice = trip.price.price_single;
    const imageUri = Array.isArray(trip.base_trips.photo_urls)
        ? trip.base_trips.photo_urls[0]
        : trip.base_trips.photo_urls || 'https://placehold.co/60x60/EEE/31343C?text=...';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={currentColors.textPrimary} />
                </TouchableOpacity>
                <ThemedText type="title">Payment</ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Your trip</ThemedText>
            <View style={styles.tripCard}>
                <Image source={{ uri: imageUri }} style={styles.tripImage} />
                <ThemedText type="defaultSemiBold" style={styles.tripName}>{trip.base_trips.title}</ThemedText>
            </View>

            <View style={styles.priceSection}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Price summary</ThemedText>
                <View style={styles.priceRow}><ThemedText type="default">Base price</ThemedText><ThemedText type="defaultSemiBold">${totalPrice}</ThemedText></View>
                <View style={styles.divider} />
                <View style={styles.priceRow}><ThemedText type="defaultSemiBold">Total</ThemedText><ThemedText type="defaultSemiBold">${totalPrice}</ThemedText></View>
            </View>
            
            <ThemedText type="subtitle" style={styles.sectionTitle}>Payment method</ThemedText>
            <View>
                <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'credit-card' && styles.selectedOption]} onPress={() => setPaymentMethod('credit-card')}>
                    <FontAwesome name="credit-card" size={24} color={currentColors.textPrimary} />
                    <ThemedText style={styles.paymentText}>Credit Card</ThemedText>
                    {paymentMethod === 'credit-card' && <Ionicons name="checkmark-circle" size={24} color={currentColors.buttonPrimary} />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'paypal' && styles.selectedOption]} onPress={() => setPaymentMethod('paypal')}>
                    <FontAwesome name="paypal" size={24} color={currentColors.textPrimary} />
                    <ThemedText style={styles.paymentText}>Paypal</ThemedText>
                    {paymentMethod === 'paypal' && <Ionicons name="checkmark-circle" size={24} color={currentColors.buttonPrimary} />}
                </TouchableOpacity>
            </View>

            {paymentMethod === 'credit-card' && (
                <View style={styles.form}>
                    <TextInput placeholder="Card Number" style={styles.input} placeholderTextColor={currentColors.textSecondary} keyboardType="numeric" />
                    <View style={styles.inputRow}>
                        <TextInput placeholder="MM/YY" style={[styles.input, styles.inputHalf]} placeholderTextColor={currentColors.textSecondary} keyboardType="numeric" />
                        <TextInput placeholder="CVC" style={[styles.input, styles.inputHalf]} placeholderTextColor={currentColors.textSecondary} keyboardType="numeric" />
                    </View>
                    <TextInput placeholder="Name" style={styles.input} placeholderTextColor={currentColors.textSecondary} />
                </View>
            )}

            <View style={styles.saveCardRow}>
                <ThemedText>Save card for future use</ThemedText>
                <Switch trackColor={{ false: currentColors.icon, true: currentColors.buttonPrimary }} thumbColor={"#f4f3f4"} onValueChange={setSaveCard} value={saveCard} />
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isBooking}>
                <ThemedText style={styles.payButtonText}>
                    {isBooking ? "Processing..." : `Pay $${totalPrice}`}
                </ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}
