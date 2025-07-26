import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import DotsIndicator from "@/components/auth/DotsIndicator";
import Step1 from "@/components/auth/Step1";
import Step2 from "@/components/auth/Step2";
import Step3 from "@/components/auth/Step3";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export interface FormData {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  dob?: string;
  age?: number;
  country?: string;
  city?: string;
  profilePhoto?: any;
}

export default function RegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 nextStep={nextStep} updateFormData={updateFormData} />;
      case 2:
        return (
          <Step2
            nextStep={nextStep}
            prevStep={prevStep}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return <Step3 prevStep={prevStep} formData={formData} />;
      default:
        return <Step1 nextStep={nextStep} updateFormData={updateFormData} />;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DotsIndicator currentStep={step} totalSteps={3} />
        <ThemedView style={styles.formContainer}>{renderStep()}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",    
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
