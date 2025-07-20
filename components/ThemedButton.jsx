import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export function ThemedButton({ title, onPress, variant = 'primary', style }) {
  const { theme } = useTheme();

  // Generate the styles using the theme
  const styles = getStyles(theme);

  // Define the text style based on the variant
  const textStyle = [
    styles.buttonPrimaryText,
  ];

  return (
    <Pressable
      onPress={onPress}
      // The style prop can be a function to react to press state
      style={({ pressed }) => [
        styles.base,
        styles[variant], // Apply base variant styles ('primary' or 'secondary')
        // Apply a specific pressed style for the primary button, and a generic one for others
        pressed && (variant === 'primary' ? styles.primaryPressed : styles.genericPressed),
        style, // Apply any custom override styles passed in props
      ]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

// Function that creates the stylesheet using the theme
const getStyles = (theme) =>
  StyleSheet.create({
    base: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 4, // 12px
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.sm,
    },
    // --- Variant Styles ---
    primary: {
      backgroundColor: theme.colors.buttonPrimary,
    },
    secondary: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    // --- Text Styles ---
    text: {
      fontSize: theme.fontSizes.body,
      fontWeight: theme.fontWeights.bold,
    },
    textPrimary: {
      color: theme.colors.buttonPrimaryText,
    },
    textSecondary: {
      color: theme.colors.text,
    },
    // --- Pressed State Styles ---
    primaryPressed: {
      backgroundColor: theme.colors.buttonPrimaryHover,
    },
    genericPressed: {
      opacity: 0.8, // Fallback for other variants like 'secondary'
    },
  });