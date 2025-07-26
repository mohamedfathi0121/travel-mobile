import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Pressable, View, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema } from "@/schemas/auth.schema";
import { z } from "zod";
import countriesAndCities from "all-countries-and-cities-json";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColor } from "@/hooks/useThemeColor";

type Step2Schema = z.infer<typeof step2Schema>;

interface Step2Props {
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Step2Schema) => void;
}

export default function Step2({ nextStep, prevStep, updateFormData }: Step2Props) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Schema>({
    resolver: zodResolver(step2Schema),
    defaultValues: { age: undefined, dob: "", country: "", city: "" },
  });

  const selectedCountry = watch("country");
  const dob = watch("dob");
  const [cities, setCities] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ Theme Colors
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const buttonHover = useThemeColor({}, "buttonPrimaryHover");
  const buttonText = useThemeColor({}, "buttonPrimaryText");
  const inputBg = useThemeColor({}, "input");
  const inputText = useThemeColor({}, "textPrimary");
  const placeholderText = useThemeColor({}, "textSecondary");

  // ✅ Update cities based on selected country
  useEffect(() => {
    if (selectedCountry) {
      setCities(countriesAndCities[selectedCountry] || []);
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  // ✅ Auto-calculate age based on DOB
  useEffect(() => {
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setValue("age", age);
    } else {
      setValue("age", undefined);
    }
  }, [dob, setValue]);

  const onSubmit = (data: Step2Schema) => {
    updateFormData(data);
    nextStep();
  };

  // ✅ Refs for "Next" field navigation
  const genderRef = useRef<any>(null);
  const dobRef = useRef<any>(null);
  const countryRef = useRef<any>(null);
  const cityRef = useRef<any>(null);

  // ✅ Local state for focus border
  const [focusField, setFocusField] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>Tell Us About Yourself</ThemedText>

      {/* ✅ Gender Select */}
      <ThemedText style={styles.label}>Gender</ThemedText>
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <View
  style={[
    styles.inputBase,
    {
      backgroundColor: inputBg,
      borderColor: focusField === "gender" ? buttonPrimary : "transparent",
      borderWidth: 1,
    },
  ]}
>
  <Picker
    selectedValue={value}
    onValueChange={onChange}
    onFocus={() => setFocusField("gender")}
    onBlur={() => setFocusField(null)}
    style={{ color: value ? inputText : placeholderText }}
  >
    <Picker.Item label="Select Gender" value="" color={placeholderText} />
    <Picker.Item label="Male" value="male" />
    <Picker.Item label="Female" value="female" />
    <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
  </Picker>
</View>
        )}
      />
      {errors.gender && <ThemedText style={styles.error}>{errors.gender.message as string}</ThemedText>}

      {/* ✅ Date of Birth */}
      <ThemedText style={styles.label}>Date of Birth</ThemedText>
      <Controller
        control={control}
        name="dob"
        render={({ field: { onChange, value } }) => (
          <>
            <Pressable
              ref={dobRef}
              onPress={() => setShowDatePicker(true)}
              onFocus={() => setFocusField("dob")}
              onBlur={() => setFocusField(null)}
              style={[
                styles.inputBase,
                {
                  backgroundColor: inputBg,
                  borderColor: focusField === "dob" ? buttonPrimary : "transparent",
                  borderWidth: 1,
                  justifyContent: "center",
                },
              ]}
            >
              <ThemedText style={{ color: value ? inputText : placeholderText }}>
                {value ? value : "Select Date"}
              </ThemedText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                maximumDate={new Date()}
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split("T")[0];
                    onChange(formattedDate);
                    countryRef.current?.focus(); // jump to next field
                  }
                }}
              />
            )}
          </>
        )}
      />
      {errors.dob && <ThemedText style={styles.error}>{errors.dob.message as string}</ThemedText>}

      {/* ✅ Auto-calculated Age */}
      <ThemedText style={styles.label}>Age</ThemedText>
      <Controller
        control={control}
        name="age"
        render={({ field: { value } }) => (
          <ThemedText
            style={[
              styles.inputBase,
              {
                backgroundColor: inputBg,
                color: inputText,
              },
            ]}
          >
            {value ? value.toString() : "—"}
          </ThemedText>
        )}
      />

      {/* ✅ Country Select */}
      <ThemedText style={styles.label}>Country</ThemedText>
      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              styles.inputBase,
              {
                backgroundColor: inputBg,
                borderColor: focusField === "country" ? buttonPrimary : "transparent",
                borderWidth: 1,
              },
            ]}
          >
            <Picker
              ref={countryRef}
              selectedValue={value}
              onValueChange={(v) => {
                onChange(v);
                cityRef.current?.focus(); // move to city
              }}
              onFocus={() => setFocusField("country")}
              onBlur={() => setFocusField(null)}
              style={{ color: value ? inputText : placeholderText }}
            >
              <Picker.Item label="Select Country" value="" color={placeholderText} />
              {Object.keys(countriesAndCities).map((country) => (
                <Picker.Item key={country} label={country} value={country} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.country && <ThemedText style={styles.error}>{errors.country.message as string}</ThemedText>}

      {/* ✅ City Select */}
      <ThemedText style={styles.label}>City</ThemedText>
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              styles.inputBase,
              {
                backgroundColor: inputBg,
                borderColor: focusField === "city" ? buttonPrimary : "transparent",
                borderWidth: 1,
              },
            ]}
          >
            <Picker
              ref={cityRef}
              enabled={cities.length > 0}
              selectedValue={value}
              onValueChange={onChange}
              onFocus={() => setFocusField("city")}
              onBlur={() => setFocusField(null)}
              style={{ color: value ? inputText : placeholderText }}
            >
              <Picker.Item
                label={cities.length ? "Select City" : "Select Country first"}
                value=""
                color={placeholderText}
              />
              {cities.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.city && <ThemedText style={styles.error}>{errors.city.message as string}</ThemedText>}

      {/* ✅ Themed Navigation Buttons */}
      <ThemedView style={styles.row}>
        <Pressable
          onPress={prevStep}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? buttonHover : buttonPrimary },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: buttonText }]}>Back</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? buttonHover : buttonPrimary },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: buttonText }]}>Next</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
  },
  inputBase: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  error: { color: "red", fontSize: 12, marginBottom: 5 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
