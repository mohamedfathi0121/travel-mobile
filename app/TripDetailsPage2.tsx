// import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
// import { useAppTheme } from '@/ThemeContext';
// import { useLocalSearchParams } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function TripDetailsPage2() {
//   const { theme } = useAppTheme();
//   const isDark = theme === 'dark';

//   const params = useLocalSearchParams();
//   const tripScheduleId = params.scheduleId as string;
//   const singlePrice = Number(params.singlePrice || 0);
//   const doublePrice = Number(params.doublePrice || 0);
//   const triplePrice = Number(params.triplePrice || 0);

//   const singleCount = Number(params.singleCount || 0);
//   const doubleCount = Number(params.doubleCount || 0);
//   const tripleCount = Number(params.tripleCount || 0);
//   const peopleCount = Number(params.peopleCount || 1);

  

//   const total = singlePrice * singleCount + doublePrice * doubleCount + triplePrice * tripleCount;

//   const handleBooking = async () => {
//   try {
//     const json = await AsyncStorage.getItem('bookingData');
//     if (!json) return alert('Missing booking data.');

//     const data = JSON.parse(json);

//     const { error } = await supabase.from('bookings').insert([data]);

//     if (error) {
//       console.error('Booking error:', error);
//       alert('Something went wrong, please try again.');
//     } else {
//       alert('✅ Booking successful!');
//     }
//   } catch (err) {
//     console.error('Unexpected error:', err);
//     alert('Unexpected error occurred');
//   }
// };

//   return (
//     <ScrollView style={[styles.container, isDark && styles.containerDark]}>
//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Prices</Text>
//         <Text style={[styles.price, isDark && styles.textLight]}>🛏️ Single: {singlePrice} EGP</Text>
//         <Text style={[styles.price, isDark && styles.textLight]}>🛏️ Double: {doublePrice} EGP</Text>
//         <Text style={[styles.price, isDark && styles.textLight]}>🛏️ Triple: {triplePrice} EGP</Text>
//       </View>

//       {/* باقي التفاصيل */}      
//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Price Included</Text>
//         <Text style={[styles.itemText, isDark && styles.textLight]}>• Accommodation</Text>
//         <Text style={[styles.itemText, isDark && styles.textLight]}>• Meals</Text>
//         <Text style={[styles.itemText, isDark && styles.textLight]}>• Local Transportation</Text>
//       </View>

//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Price Not Included</Text>
//         <Text style={[styles.itemText, isDark && styles.textLight]}>• Flights</Text>
//         <Text style={[styles.itemText, isDark && styles.textLight]}>• Personal Expenses</Text>
//       </View>

//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Traveler Reviews</Text>
//         {[5, 4, 3, 2, 1].map((star, index) => {
//           const percentage = [50, 30, 10, 5, 5][index];
//           return (
//             <View key={star} style={styles.reviewRow}>
//               <Text style={[styles.reviewStar, isDark && styles.textLight]}>{star}★</Text>
//               <View style={styles.reviewBarContainer}>
//                 <View style={[styles.reviewBar, { width: `${percentage}%` }]} />
//               </View>
//               <Text style={[styles.reviewPercentage, isDark && styles.textLight]}>{percentage}%</Text>
//             </View>
//           );
//         })}
//       </View>

//      <TouchableOpacity style={styles.button} onPress={handleBooking}>
//   <Text style={styles.buttonText}>Book Now</Text>
// </TouchableOpacity>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 16, paddingTop: 24, backgroundColor: '#ffffff' },
//   containerDark: { backgroundColor: '#000000' },
//   section: { marginBottom: 24 },
//   pageTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#1f2937',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#1f2937',
//   },
//   itemText: {
//     fontSize: 14,
//     color: '#4b5563',
//     marginBottom: 4,
//   },
//   textDark: {
//     color: '#ffffff',
//   },
//   textLight: {
//     color: '#d1d5db',
//   },
//   price: { fontSize: 14, marginBottom: 4 },
//   reviewRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   reviewStar: {
//     width: 28,
//     fontSize: 14,
//     textAlign: 'left',
//   },
//   reviewBarContainer: {
//     flex: 1,
//     height: 8,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 4,
//     marginHorizontal: 8,
//   },
//   reviewBar: {
//     height: 8,
//     backgroundColor: '#3b82f6',
//     borderRadius: 4,
//   },
//   reviewPercentage: {
//     width: 40,
//     fontSize: 12,
//   },
//   button: {
//     backgroundColor: '#16a34a',
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginBottom: 40,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     textAlign: 'center',
//   },
// });
