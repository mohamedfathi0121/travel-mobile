import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { FormData as AllFormData } from "@/app/(public)/Register";

// ✅ Updated schema for React Native
export const step3Schema = z.object({
  profilePhoto: z.object({
    uri: z.string().min(1, "Profile photo is required"),
    name: z.string().min(1),
    type: z
      .string()
      .refine(
        (val) =>
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(val),
        "Only JPG, PNG, or WEBP images are allowed"
      ),
  }),
});
type Step3Schema = z.infer<typeof step3Schema>;

interface Step3Props {
  prevStep: () => void;
  formData: AllFormData;
}

export default function Step3({ prevStep, formData }: Step3Props) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step3Schema>({
    resolver: zodResolver(step3Schema),
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

 const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ImagePicker.MediaTypeOptions.Images,// ✅ Works for older Expo versions
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    console.log("✅ Picked image:", asset);

    // ✅ Ensure we always pass the correct MIME type
    const mime =
      asset.mimeType ||
      (asset.uri.endsWith(".png")
        ? "image/png"
        : asset.uri.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg");

    setPreview(asset.uri);
    setValue("profilePhoto", {
      uri: asset.uri,
      name: asset.fileName || "avatar.jpg",
      type: mime, // ✅ Zod expects this
    });
  }
};
  const onSubmit = async (data: Step3Schema) => {
    console.log("✅ Submitting with data:", data);
    setIsSubmitting(true);

    try {
      const apiFormData = new FormData();
      apiFormData.append("email", formData.email || "");
      apiFormData.append("password", formData.password || "");
      apiFormData.append("displayName", formData.fullName || "");
      apiFormData.append("age", String(formData.age || ""));
      apiFormData.append("gender", formData.gender || "");
      apiFormData.append("dateOfBirth", formData.dob || "");
      apiFormData.append("country", formData.country || "");
      apiFormData.append("city", formData.city || "");
      apiFormData.append("avatarFile", {
        uri: data.profilePhoto.uri,
        name: data.profilePhoto.name,
        type: data.profilePhoto.type,
      } as any);

      const { data: response, error } = await supabase.functions.invoke(
        "user-register",
        { body: apiFormData }
      );

      if (error) throw error;

      console.log("✅ Edge Function Success:", response);
      alert("Registration Completed Successfully!");
      router.replace("/Login");
    } catch (err: any) {
      console.error("❌ Edge Function Error:", err);
      alert("Registration failed: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (validationErrors: any) => {
    console.log("❌ Validation Errors:", validationErrors);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add a Profile Photo</Text>

      {/* ✅ Pick Image Button */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Photo</Text>
      </TouchableOpacity>

      {/* ✅ Preview */}
      {preview && <Image source={{ uri: preview }} style={styles.image} />}

      {/* ✅ Validation Error */}
      {errors.profilePhoto && (
        <Text style={styles.error}>{errors.profilePhoto.message}</Text>
      )}

      {/* ✅ Complete Registration Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2563eb" }]}
        onPress={handleSubmit(onSubmit, onError)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: "#fff" }]}>
            Complete Registration
          </Text>
        )}
      </TouchableOpacity>

      {/* ✅ Back Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#6b7280" }]}
        onPress={prevStep}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginVertical: 10,
  },
  error: { color: "red", fontSize: 12, textAlign: "center", marginBottom: 5 },
});
