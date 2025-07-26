import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { step1Schema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { supabase } from "../../lib/supabase";

type Step1Schema = z.infer<typeof step1Schema>;

interface Step1Props {
  nextStep: () => void;
  updateFormData: (data: Step1Schema) => void;
}

export default function Step1({ nextStep, updateFormData }: Step1Props) {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Step1Schema>({ resolver: zodResolver(step1Schema) });

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ✅ Theme colors
  const textColor = useThemeColor({}, "textPrimary");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const buttonHover = useThemeColor({}, "buttonPrimaryHover");
  const buttonText = useThemeColor({}, "buttonPrimaryText");

  // ✅ Refs for "Next" field navigation
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const onSubmit = async (data: Step1Schema) => {
    setCheckingEmail(true);
    const { data: result, error } = await supabase.functions.invoke(
      "check-email-exists",
      { body: { email: data.email } }
    );

    setCheckingEmail(false);

    if (error) {
      setError("email", { message: "Server error, please try again." });
      return;
    }

    if (result?.exists) {
      setError("email", { message: "Email already exists." });
    } else {
      clearErrors("email");
      updateFormData(data);
      nextStep();
    }
  };

  // ✅ Labeled Input with Focused Border & Tab Navigation
const LabeledInput = ({
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
  const [isFocused, setIsFocused] = useState(false);
  const textColor = useThemeColor({}, "textPrimary");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");

  return (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.label, { color: textColor }]}>{label}</ThemedText>
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            borderColor: isFocused
              ? buttonPrimary
              : error
              ? "red"
              : "#d1d5db",
            color: textColor,
          },
        ]}
      />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
};
  return (
    <View>
      <ThemedText style={styles.heading}>Create Your Account</ThemedText>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <LabeledInput
            label="Full Name"
            value={value}
            onChange={onChange}
            error={errors.fullName?.message}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <LabeledInput
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <LabeledInput
            label="Password"
            value={value}
            onChange={onChange}
            secureTextEntry
            error={errors.password?.message}
            inputRef={passwordRef}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <LabeledInput
            label="Confirm Password"
            value={value}
            onChange={onChange}
            secureTextEntry
            error={errors.confirmPassword?.message}
            inputRef={confirmPasswordRef}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="done"
          />
        )}
      />

      {/* ✅ Themed Button */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={checkingEmail}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? buttonHover : buttonPrimary,
            opacity: checkingEmail ? 0.6 : 1,
          },
        ]}
      >
        {checkingEmail ? (
          <ActivityIndicator color={buttonText} />
        ) : (
          <ThemedText style={[styles.buttonText, { color: buttonText }]}>
            Next
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
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
