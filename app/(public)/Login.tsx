import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";

// ✅ Zod Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const { signIn } = useAuth();
  const router = useRouter();

  // ✅ Theme colors
  const textColor = useThemeColor({}, "textPrimary");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const buttonHover = useThemeColor({}, "buttonPrimaryHover");
  const buttonText = useThemeColor({}, "buttonPrimaryText");
  const cardBg = useThemeColor({}, "background");

  // ✅ Refs for Next navigation between fields
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const onSubmit = async (data: LoginSchema) => {
    Toast.show({ type: "info", text1: "Signing in..." });

    try {
      const { error } = await signIn(data.email, data.password);
      if (error) throw error;

      Toast.show({ type: "success", text1: "Login successful!" });
      router.replace("/(private)/(tabs)/Home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message || "An unexpected error occurred.",
      });
    }
  };

  // ✅ Reusable Themed Input
  const ThemedInput = ({
    label,
    value,
    onChange,
    secureTextEntry = false,
    keyboardType = "default",
    error,
    inputRef,
    onSubmitEditing,
    returnKeyType = "next",
  }: {
    label: string;
    value: string;
    onChange: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    error?: string;
    inputRef?: React.RefObject<TextInput | null>;
    onSubmitEditing?: () => void;
    returnKeyType?: "next" | "done";
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          {label}
        </ThemedText>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={label}
          placeholderTextColor="#9ca3af"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              borderColor: focused ? buttonPrimary : error ? "red" : "#6b7280",
              color: textColor,
              backgroundColor: cardBg,
            },
          ]}
        />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText style={[styles.heading, { color: textColor }]}>
          Welcome Back
        </ThemedText>

        {/* ✅ Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <ThemedInput
              label="Email"
              value={value}
              onChange={onChange}
              keyboardType="email-address"
              error={errors.email?.message}
              inputRef={emailRef}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        />

        {/* ✅ Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <ThemedInput
              label="Password"
              value={value}
              onChange={onChange}
              secureTextEntry
              error={errors.password?.message}
              inputRef={passwordRef}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        {/* ✅ Button */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? buttonHover : buttonPrimary,
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={buttonText} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: buttonText }]}>
              Log in
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: "red", fontSize: 12, marginTop: 4 },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
