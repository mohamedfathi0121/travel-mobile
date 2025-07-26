import { Stack } from "expo-router";

export default function PrivateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="BookingConfirmed" />
      {/* <Stack.Screen name="Payment" /> */}
      <Stack.Screen name="TripInfo" />
    </Stack>
  );
}
