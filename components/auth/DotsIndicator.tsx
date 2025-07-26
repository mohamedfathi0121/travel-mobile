import React from "react";
import { View, StyleSheet } from "react-native";

interface DotsIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function DotsIndicator({ currentStep, totalSteps }: DotsIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentStep === index + 1 && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3b82f6",
  },
});
