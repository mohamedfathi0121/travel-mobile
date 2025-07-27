import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/ThemeContext';
import * as Linking from 'expo-linking';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';


type Trip = {
  id: string;
  title: string;
  description: string;
  country: string;
  city: string;
  photo_urls: string[];
  video_url: string;
  average_rating: number;
  review_count: number;
};

type Schedule = {
  id: string;
  price: {
    price_single: string;
    price_double: string;
    price_triple: string;
  };
};

export default function TripDetailsPage() {
  // Using a hardcoded ID for testing as you requested
  // const { trip_id } = useLocalSearchParams<{ trip_id: string }>();
  const trip_id = '5efa14ae-8350-4836-af3c-ab9ff5a5332f'; // Example ID

  const [trip, setTrip] = useState<Trip | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [singleCount, setSingleCount] = useState(0);
  const [doubleCount, setDoubleCount] = useState(0);
  const [tripleCount, setTripleCount] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newBookingId, setNewBookingId] = useState<string | null>(null);

  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const handleOpenVR = () => {
    if (trip?.video_url) {
      Linking.openURL(trip.video_url);
    }
  };

  useEffect(() => {
    if (trip_id) {
      fetchData();
    } else {
      setIsLoading(false);
      console.error("Trip ID is missing.");
    }
  }, [trip_id]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: baseTrip, error: tripError } = await supabase
        .from('base_trips')
        .select('*')
        .eq('id', trip_id)
        .single();
      if (tripError) throw tripError;
      if (!baseTrip) throw new Error("Trip not found.");

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('trip_schedules')
        .select('id, price')
        .eq('base_trip_id', baseTrip.id)
        .limit(1)
        .maybeSingle();
      if (scheduleError) throw scheduleError;

      if (scheduleData) {
        setTrip(baseTrip as Trip);
        setSchedule(scheduleData as Schedule);
      } else {
        throw new Error("Schedule for this trip not found.");
      }
    } catch (error: any) {
      console.error("Fetch data error:", error);
      setModalMessage(error.message);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  }

  const singlePrice = Number(schedule?.price?.price_single || 0);
  const doublePrice = Number(schedule?.price?.price_double || 0);
  const triplePrice = Number(schedule?.price?.price_triple || 0);
  const total = singlePrice * singleCount + doublePrice * doubleCount + triplePrice * tripleCount;

  const getRoomCapacity = () => {
    return singleCount * 1 + doubleCount * 2 + tripleCount * 3;
  };

  const handleChange = (type: 'people' | 'single' | 'double' | 'triple', op: number) => {
    if (type === 'people') setPeopleCount(prev => Math.max(1, prev + op));
    if (type === 'single') setSingleCount(prev => Math.max(0, prev + op));
    if (type === 'double') setDoubleCount(prev => Math.max(0, prev + op));
    if (type === 'triple') setTripleCount(prev => Math.max(0, prev + op));
  };

  const handleBooking = async () => {
    const capacity = getRoomCapacity();
    if (singleCount + doubleCount + tripleCount === 0) {
      setModalMessage('Please select at least one room before booking.');
      return setShowModal(true);
    }
    if (peopleCount > capacity) {
      setModalMessage(
        `You selected ${peopleCount} people but the selected rooms can hold only ${capacity} person(s).\nPlease add more rooms or reduce number of people.`
      );
      return setShowModal(true);
    }
    if (!schedule) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setModalMessage('Please log in to book a trip.');
        return setShowModal(true);
      }
      const bookingData = {
        user_id: user.id,
        trip_schedule_id: schedule.id,
        booking_date: new Date().toISOString(),
        payment_status: 'pending',
        ticket_id: `TICK-${Date.now()}`,
        total_price: { amount: total, currency: 'EGP' },
        attendees: { members: peopleCount },
        rooms: {
          single: singleCount,
          double: doubleCount,
          triple: tripleCount,
        },
      };
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (error) throw error;
      if (!newBooking) throw new Error("Booking failed, no ID returned.");
      
      setNewBookingId(newBooking.id);
      setSuccessModal(true);
      
      setPeopleCount(1);
      setSingleCount(0);
      setDoubleCount(0);
      setTripleCount(0);
    } catch (err: any) {
      console.error('Booking error:', err);
      setModalMessage(`Failed to book. ${err.message}`);
      setShowModal(true);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!trip || !schedule) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.loading, isDark ? styles.loadingDark : styles.loadingLight]}>
          Could not load trip details. Please go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDark && styles.darkBg]}>
      <TouchableOpacity onPress={handleOpenVR} activeOpacity={0.8}>
        <View style={styles.mainVideo}>
          <Image
            source={{ uri: trip.photo_urls?.[0] || 'https://placehold.co/600x400?text=Video' }}
            style={{ width: '100%', height: 240 }}
            resizeMode="cover"
          />
          <View style={styles.playButtonOverlay}>
            <Text style={styles.playButton}>▶ VR</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.section}>
        <Text style={[styles.title, isDark && styles.whiteText]}>{trip.title}</Text>
        <Text style={[styles.location, isDark && styles.lightText]}>📍 {trip.city}, {trip.country}</Text>
        <Text style={styles.rating}>⭐ {trip.average_rating?.toFixed(1)} ({trip.review_count} reviews)</Text>
      </View>
      
      {/* ✅ --- بداية الأجزاء المضافة من الكود القديم --- */}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Description</Text>
        <Text style={[styles.description, isDark && styles.lightText]}>{trip.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Photo Gallery</Text>
        <View style={styles.galleryContainer}>
          <TouchableOpacity onPress={() => setPhotoIndex(prev => Math.max(prev - 1, 0))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.photosRow}>
            {trip.photo_urls.slice(photoIndex, photoIndex + 3).map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.galleryImage} resizeMode="cover" />
            ))}
          </View>
          <TouchableOpacity onPress={() => setPhotoIndex(prev => (prev + 3 < trip.photo_urls.length ? prev + 1 : prev))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Price Included</Text>
        <Text style={[styles.itemText, isDark && styles.textLight]}>• Accommodation</Text>
        <Text style={[styles.itemText, isDark && styles.textLight]}>• Meals</Text>
        <Text style={[styles.itemText, isDark && styles.textLight]}>• Local Transportation</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Price Not Included</Text>
        <Text style={[styles.itemText, isDark && styles.textLight]}>• Flights</Text>
        <Text style={[styles.itemText, isDark && styles.textLight]}>• Personal Expenses</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Traveler Reviews</Text>
        {[5, 4, 3, 2, 1].map((star, index) => {
          const percentage = [50, 30, 10, 5, 5][index];
          return (
            <View key={star} style={styles.reviewRow}>
              <Text style={[styles.reviewStar, isDark && styles.textLight]}>{star}★</Text>
              <View style={styles.reviewBarContainer}>
                <View style={[styles.reviewBar, { width: `${percentage}%` }]} />
              </View>
              <Text style={[styles.reviewPercentage, isDark && styles.textLight]}>{percentage}%</Text>
            </View>
          );
        })}
      </View>

      {/* ✅ --- نهاية الأجزاء المضافة --- */}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Room Prices</Text>
        <Text style={[styles.price, isDark && styles.lightText]}>🛏️ Single: {singlePrice} EGP</Text>
        <Text style={[styles.price, isDark && styles.lightText]}>🛏️ Double: {doublePrice} EGP</Text>
        <Text style={[styles.price, isDark && styles.lightText]}>🛏️ Triple: {triplePrice} EGP</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Number of People</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity onPress={() => handleChange('people', -1)} style={styles.counterButton}><Text style={styles.counterText}>−</Text></TouchableOpacity>
          <Text style={[styles.counterText, isDark && styles.whiteText]}>{peopleCount}</Text>
          <TouchableOpacity onPress={() => handleChange('people', 1)} style={styles.counterButton}><Text style={styles.counterText}>+</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Room Selection</Text>
        {(['single', 'double', 'triple'] as const).map((type) => (
          <View key={type} style={styles.roomRow}>
            <Text style={[styles.itemText, isDark && styles.lightText]}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Room
            </Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => handleChange(type, -1)} style={styles.counterButton}>
                <Text style={[styles.counterText, isDark && styles.whiteText]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.counterText, isDark && styles.whiteText]}>
                {type === 'single' ? singleCount : type === 'double' ? doubleCount : tripleCount}
              </Text>
              <TouchableOpacity onPress={() => handleChange(type, 1)} style={styles.counterButton}>
                <Text style={[styles.counterText, isDark && styles.whiteText]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Total Price</Text>
        <Text style={[styles.price, isDark && styles.lightText]}>{total} EGP</Text>
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={handleBooking}>
        <Text style={styles.nextButtonText}>Book Now</Text>
      </TouchableOpacity>
      
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModal]}>
            <Text style={[styles.modalText, isDark && styles.whiteText]}>
              ✅ Booking completed successfully!
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                if (newBookingId) {
                  // Make sure your payment screen file is named PaymentScreen.tsx
                  router.push({
                      pathname: '/Payment', 
                      params: { booking_id: newBookingId }
                  });
                }
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Go to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModal]}>
            <Text style={[styles.modalText, isDark && styles.whiteText]}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ... (The styles object remains the same as your new version's styles)
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    darkBg: { backgroundColor: '#000000' },
    mainVideo: { width: '100%', height: 240, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#fff' },
    playButtonOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    playButton: { color: '#fff', fontSize: 32, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50 },
    section: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    whiteText: { color: '#fff' },
    lightText: { color: '#ccc' },
    location: { fontSize: 14, color: '#666', marginTop: 4 },
    rating: { fontSize: 14, color: '#facc15', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#333' },
    description: { fontSize: 14, color: '#555', lineHeight: 22 },
    price: { fontSize: 14, color: '#444', marginBottom: 4 },
    itemText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
    counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    counterContainer: { flexDirection: 'row', alignItems: 'center' },
    counterButton: { backgroundColor: '#d1d5db', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    counterText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8, color: '#111' },
    nextButton: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, marginBottom: 40, marginTop: 10 },
    nextButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
    loading: { textAlign: 'center', marginTop: 40, fontSize: 16 },
    loadingLight: { color: '#555' },
    loadingDark: { color: '#ccc' },
    galleryContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    photosRow: { flexDirection: 'row', gap: 8 },
    galleryImage: { width: 120, height: 120, borderRadius: 12, marginHorizontal: 6 },
    arrowButton: { padding: 10 },
    arrowText: { fontSize: 24, color: '#2563eb' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '85%', alignItems: 'center' },
    darkModal: { backgroundColor: '#2d3748' },
    modalText: { fontSize: 16, marginBottom: 20, textAlign: 'center', lineHeight: 24 },
    modalButton: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    textDark: { color: '#fff' },
  textLight: {
  
  color: '#666',
},

    reviewStar: { width: 28, fontSize: 14, textAlign: 'left' },
    reviewBarContainer: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginHorizontal: 8 },
    reviewBar: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
    reviewPercentage: { width: 40, fontSize: 12 },
    reviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});