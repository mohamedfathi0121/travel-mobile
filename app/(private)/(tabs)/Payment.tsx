import { useEffect, useState } from 'react';

import { StyleSheet, Image, TouchableOpacity, ScrollView,  Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText'; 
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors'; 
import { ThemedView } from '@/components/ThemedView';

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


const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 50, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
    backButton: { position: 'absolute', left: 0, zIndex: 1 },
    sectionTitle: { marginTop: 20, marginBottom: 10 },
    tripCard: { borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    tripImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
    tripName: { marginLeft: 15, flex: 1 },
    priceSection: { marginTop: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, marginVertical: 15 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderRadius: 12, marginBottom: 10 },
    paymentText: { flex: 1, marginLeft: 15, fontSize: 16 },
    form: { marginTop: 20 },
    input: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
    inputHalf: { width: '48%' },
    saveCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
    payButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 'auto'},
    payButtonText: { fontSize: 18, fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default function PaymentScreen() {
     const navigation = useNavigation();
    const params = useLocalSearchParams();
    
    // ✅ 1. استقبال كل بيانات الحجز من الصفحة السابقة
    const { trip_id, singleRooms, doubleRooms, tripleRooms, members } = params;

    const theme = useColorScheme() ?? 'light';
    const isDark = theme === 'dark';
    
    const [trip, setTrip] = useState<TripData | null>(null);
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
    const [saveCard, setSaveCard] = useState<boolean>(false);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchTripDetails = async () => {
             if (!trip_id) {
                 Alert.alert("Error", "Trip ID is missing.");
                 setIsLoadingTrip(false);
                 return;
             }
             try {
                // الكود الحالي لجلب بيانات الرحلة صحيح ويعتمد على trip_id
                 const { data: scheduleData, error: scheduleError } = await supabase.from('trip_schedules').select('*, base_trip_id').eq('id', trip_id).single();
                 if (scheduleError) throw scheduleError;
                 if (!scheduleData) throw new Error("Trip schedule not found.");

                 const { data: baseTripData, error: baseTripError } = await supabase.from('base_trips').select('*').eq('id', scheduleData.base_trip_id).single();
                 if (baseTripError) throw baseTripError;

                 const combinedData = { ...scheduleData, base_trips: baseTripData };
                 setTrip(combinedData as TripData);
             } catch (error: any) {
                 Alert.alert("Error", `Could not load trip details: ${error.message}`);
             } finally {
                 setIsLoadingTrip(false);
             }
        };
        fetchTripDetails();
    }, [trip_id]);

    const handlePayment = async () => {
        if (!trip) return;

        const testUserId = 'bfb39f6b-b563-4ed2-974b-af30f1a53d76';
        setIsBooking(true);
        try {
            
            const bookingDetails = {
                trip_schedule_id: trip.id,
                user_id: testUserId,
                booking_info: { 
                    singleRooms: Number(singleRooms || 0), 
                    doubleRooms: Number(doubleRooms || 0), 
                    tripleRooms: Number(tripleRooms || 0), 
                    members: Number(members || 1) 
                }
            };
            const { data, error } = await supabase.functions.invoke('create-checkout-session', { body: bookingDetails });
            if (error) throw new Error(error.message);
            if (data.url) await WebBrowser.openBrowserAsync(data.url);
        } catch (error: any) {
            Alert.alert('Error', `Could not start the payment process: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };


    if (isLoadingTrip) {
        return (
            <ThemedView style={[styles.centered, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
                <ActivityIndicator size="large" color={isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary} />
            </ThemedView>
        );
    }

    if (!trip) {
        return (
            <ThemedView style={[styles.centered, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
                <ThemedText>Trip not found.</ThemedText>
            </ThemedView>
        );
    }
    
    const totalPrice = trip.price.price_single;
    const imageUri = Array.isArray(trip.base_trips.photo_urls) ? trip.base_trips.photo_urls[0] : trip.base_trips.photo_urls || 'https://placehold.co/60x60/EEE/31343C?text=...';

    
    return (
     <ThemedView style={styles.container}>
 <ScrollView
    
        contentContainerStyle={styles.contentContainer}
    >
            {/* <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
                </TouchableOpacity>
                <ThemedText type="title">Payment</ThemedText>
            </ThemedView> */}

            <ThemedText type="subtitle" style={styles.sectionTitle}>Your trip</ThemedText>
            <ThemedView style={[styles.tripCard]}>
                <Image source={{ uri: imageUri }} style={styles.tripImage} />
                <ThemedText type="defaultSemiBold" style={styles.tripName}>{trip.base_trips.title}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.priceSection}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Price summary</ThemedText>
                <ThemedView style={styles.priceRow}><ThemedText type="default">Base price</ThemedText><ThemedText type="defaultSemiBold">${totalPrice}</ThemedText></ThemedView>
                <ThemedView style={[styles.divider, { backgroundColor: isDark ? Colors.dark.input : Colors.light.input }]} />
                <ThemedView style={styles.priceRow}><ThemedText type="defaultSemiBold">Total</ThemedText><ThemedText type="defaultSemiBold">${totalPrice}</ThemedText></ThemedView>
            </ThemedView>
            
            {/* <ThemedText type="subtitle" style={styles.sectionTitle}>Payment method</ThemedText>
            <ThemedView>
                <TouchableOpacity 
                    style={[styles.paymentOption, { borderColor: isDark ? Colors.dark.input : Colors.light.input }, paymentMethod === 'credit-card' && { borderColor: isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary, borderWidth: 1.5 }]}
                    onPress={() => setPaymentMethod('credit-card')}>
                    <FontAwesome name="credit-card" size={24} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
                    <ThemedText style={styles.paymentText}>Credit Card</ThemedText>
                    {paymentMethod === 'credit-card' && <Ionicons name="checkmark-circle" size={24} color={isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary} />}
                </TouchableOpacity>
                 <TouchableOpacity 
                    style={[styles.paymentOption, { borderColor: isDark ? Colors.dark.input : Colors.light.input }, paymentMethod === 'paypal' && { borderColor: isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary, borderWidth: 1.5 }]}
                    onPress={() => setPaymentMethod('paypal')}>
                    <FontAwesome name="paypal" size={24} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
                    <ThemedText style={styles.paymentText}>Paypal</ThemedText>
                    {paymentMethod === 'paypal' && <Ionicons name="checkmark-circle" size={24} color={isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary} />}
                </TouchableOpacity>
            </ThemedView>

            {paymentMethod === 'credit-card' && (
                <ThemedView style={styles.form}>
                    <TextInput placeholder="Card Number" style={[styles.input, { backgroundColor: isDark ? Colors.dark.input : Colors.light.input, color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary }]} placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} keyboardType="numeric" />
                    <ThemedView style={styles.inputRow}>
                        <TextInput placeholder="MM/YY" style={[styles.input, styles.inputHalf, { backgroundColor: isDark ? Colors.dark.input : Colors.light.input, color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary }]} placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} keyboardType="numeric" />
                        <TextInput placeholder="CVC" style={[styles.input, styles.inputHalf, { backgroundColor: isDark ? Colors.dark.input : Colors.light.input, color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary }]} placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} keyboardType="numeric" />
                    </ThemedView>
                    <TextInput placeholder="Name" style={[styles.input, { backgroundColor: isDark ? Colors.dark.input : Colors.light.input, color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary }]} placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                </ThemedView>
            )}

            <ThemedView style={styles.saveCardRow}>
                <ThemedText>Save card for future use</ThemedText>
                <Switch trackColor={{ false: isDark ? Colors.dark.icon : Colors.light.icon, true: isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary }} thumbColor={"#f4f3f4"} onValueChange={setSaveCard} value={saveCard} />
            </ThemedView> */}

            <TouchableOpacity 
                style={[styles.payButton, { backgroundColor: isDark ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary, opacity: isBooking ? 0.7 : 1 }]}
                onPress={handlePayment} disabled={isBooking}>
                <ThemedText style={[styles.payButtonText, { color: isDark ? Colors.dark.buttonPrimaryText : Colors.light.buttonPrimaryText }]}>
                    {isBooking ? "Processing..." : `Pay $${totalPrice}`}
                </ThemedText>
            </TouchableOpacity>
        </ScrollView>
</ThemedView>
    );
}