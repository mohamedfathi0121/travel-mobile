"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/Colors";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

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

  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("base_trips").select("*");
      if (!error && data) {
        const now = new Date();
        const activeTrips = data.filter((trip) => {
          const endDate = new Date(trip.end_date);
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

    if (city) result = result.filter((trip) => trip.city?.toLowerCase().includes(city.toLowerCase()));
    if (price) result = result.filter((trip) => Number(trip.price) <= Number(price));
    if (time) result = result.filter((trip) => trip.time?.toLowerCase().includes(time.toLowerCase()));
    if (country) result = result.filter((trip) => trip.country?.toLowerCase().includes(country.toLowerCase()));

    setFilteredTrips(result);
    setCurrentPage(1);
  };

  const start = (currentPage - 1) * tripsPerPage;
  const currentTrips = filteredTrips.slice(start, start + tripsPerPage);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const renderSkeletons = () => (
    <SkeletonPlaceholder backgroundColor="#e1e9ee" highlightColor="#f2f8fc">
      {[...Array(tripsPerPage)].map((_, index) => (
        <View key={index} className="bg-input p-3 rounded mb-3">
          <View className="w-full h-44 rounded mb-2" />
          <View className="h-4 w-2/3 mb-2 rounded" />
          <View className="h-3 w-full mb-1 rounded" />
          <View className="h-3 w-1/2 mb-1 rounded" />
        </View>
      ))}
    </SkeletonPlaceholder>
  );

  return (
    <View className="flex-1 p-4 bg-background">
      <Text className="text-2xl font-bold text-text-primary mb-4">All Trips</Text>

      {/* Filters */}
      <View className="gap-2 mb-4">
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor={colors.textSecondary}
          className="bg-input text-text-primary p-3 rounded"
        />
        <TextInput
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
          placeholderTextColor={colors.textSecondary}
          className="bg-input text-text-primary p-3 rounded"
        />
        <TextInput
          placeholder="Max Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={colors.textSecondary}
          className="bg-input text-text-primary p-3 rounded"
        />
        <TextInput
          placeholder="Time"
          value={time}
          onChangeText={setTime}
          placeholderTextColor={colors.textSecondary}
          className="bg-input text-text-primary p-3 rounded"
        />
        <TouchableOpacity
          onPress={handleFilter}
          className="bg-buttonPrimary p-3 rounded items-center"
        >
          <Text className="text-buttonPrimaryText font-semibold">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Trip List or Skeleton */}
      {loading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={currentTrips}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View className="bg-input p-3 rounded shadow-sm mb-2">
              {item.photo_urls ? (
                <Image source={{ uri: item.photo_urls }} className="w-full h-44 rounded mb-2" />
              ) : (
                <View className="w-full h-44 bg-gray-300 rounded items-center justify-center mb-2">
                  <Text className="text-textSecondary">No Image</Text>
                </View>
              )}
              <Text className="text-lg font-bold text-text-primary mb-1">{item.title}</Text>
              <Text className="text-text-primary">{item.description}</Text>
              <Text className="text-text-primary">City: {item.city}</Text>
              <Text className="text-text-primary">Country: {item.country}</Text>
              <Text className="text-text-primary">Price: ${item.price}</Text>
              <Text className="text-text-primary">Time: {item.time}</Text>
            </View>
          )}
        />
      )}

      {/* Pagination */}
      <View className="mt-6 px-4">
        <View className="flex-row justify-center flex-wrap gap-2">
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <Text className="text-text-primary">Previous</Text>
          </TouchableOpacity>

          {[...Array(totalPages)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === i + 1 ? "bg-buttonPrimary" : "bg-gray-200"
              }`}
            >
              <Text
                className={
                  currentPage === i + 1 ? "text-white" : "text-text-primary"
                }
              >
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <Text className="text-text-primary">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AllTrips;
