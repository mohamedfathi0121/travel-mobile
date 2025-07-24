"use client";

import React, { useEffect, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabase";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const AllTrips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [city, setCity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tripsPerPage = 6;

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trip_schedules")
        .select("*, base_trips(*)");
      if (!error && data) {
        const now = new Date();
        const activeTrips = data.filter((item) => {
          const endDate = new Date(item.base_trips?.end_date);
          return endDate >= now;
        });
        setTrips(activeTrips);
        setFilteredTrips(activeTrips);
      }
      setLoading(false);
    };

    fetchTrips();
  }, []);

  const handleFilter = () => {
    let result = trips;

    if (city) result = result.filter((trip) => trip.base_trips?.city?.toLowerCase().includes(city.toLowerCase()));
    if (price) result = result.filter((trip) => Number(trip.base_trips?.price) <= Number(price));
    if (time) result = result.filter((trip) => trip.base_trips?.time?.toLowerCase().includes(time.toLowerCase()));
    if (country) result = result.filter((trip) => trip.base_trips?.country?.toLowerCase().includes(country.toLowerCase()));

    setFilteredTrips(result);
    setCurrentPage(1);
  };

  const start = (currentPage - 1) * tripsPerPage;
  const currentTrips = filteredTrips.slice(start, start + tripsPerPage);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const renderSkeletons = () => (
    <SkeletonPlaceholder backgroundColor="#e1e9ee" highlightColor="#f2f8fc">
      {[...Array(tripsPerPage)].map((_, index) => (
        <ThemedView key={index} className="bg-input p-3 rounded mb-3">
          <ThemedView className="w-full h-44 rounded mb-2" />
          <ThemedView className="h-4 w-2/3 mb-2 rounded" />
          <ThemedView className="h-3 w-full mb-1 rounded" />
          <ThemedView className="h-3 w-1/2 mb-1 rounded" />
        </ThemedView>
      ))}
    </SkeletonPlaceholder>
  );

  return (
    <ThemedView className="flex-1 p-4 bg-background">
      <ThemedText className="text-2xl font-bold text-textPrimary mb-4">All Trips</ThemedText>

      {/* Filters */}
      <ThemedView className="gap-2 mb-4">
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#94a3b8"
          className="bg-input text-textPrimary p-3 rounded"
        />
        <TextInput
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
          placeholderTextColor="#94a3b8"
          className="bg-input text-textPrimary p-3 rounded"
        />
        <TextInput
          placeholder="Max Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor="#94a3b8"
          className="bg-input text-textPrimary p-3 rounded"
        />
        <TextInput
          placeholder="Time"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#94a3b8"
          className="bg-input text-textPrimary p-3 rounded"
        />
        <TouchableOpacity
          onPress={handleFilter}
          className="bg-buttonPrimary p-3 rounded items-center"
        >
          <ThemedText className="text-buttonPrimaryText font-semibold">Filter</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Trip List or Skeleton */}
      {loading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={currentTrips}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <ThemedView className="bg-input p-3 rounded shadow-sm mb-2">
              {item.base_trips?.photo_urls ? (
                <Image source={{ uri: item.base_trips.photo_urls }} className="w-full h-44 rounded mb-2" />
              ) : (
                <ThemedView className="w-full h-44 bg-gray-300 rounded items-center justify-center mb-2">
                  <ThemedText className="text-textSecondary">No Image</ThemedText>
                </ThemedView>
              )}
              <ThemedText className="text-lg font-bold text-textPrimary mb-1">{item.base_trips?.title}</ThemedText>
              <ThemedText className="text-textPrimary">{item.base_trips?.description}</ThemedText>
              <ThemedText className="text-textPrimary">City: {item.base_trips?.city}</ThemedText>
              <ThemedText className="text-textPrimary">Country: {item.base_trips?.country}</ThemedText>
              <ThemedText className="text-textPrimary">Price: ${item.base_trips?.price}</ThemedText>
              <ThemedText className="text-textPrimary">Time: {item.base_trips?.time}</ThemedText>
            </ThemedView>
          )}
        />
      )}

      {/* Pagination */}
      <ThemedView className="mt-6 px-4">
        <ThemedView className="flex-row justify-center flex-wrap gap-2">
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <ThemedText className="text-textPrimary">Previous</ThemedText>
          </TouchableOpacity>

          {[...Array(totalPages)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === i + 1 ? "bg-buttonPrimary" : "bg-gray-200"
              }`}
            >
              <ThemedText className={currentPage === i + 1 ? "text-white" : "text-textPrimary"}>
                {i + 1}
              </ThemedText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <ThemedText className="text-textPrimary">Next</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default AllTrips;
