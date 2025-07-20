/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#59738c",
    textHardSecondary: "#59738c",
    buttonPrimary: "#367dc9",
    buttonPrimaryHover: "#135296",
    buttonPrimaryText: "#e2e8f0",
    input: "#e8edf2",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    background: "#0f1a24",
    textPrimary: "#e2e8f0",
    textSecondary: "#94a3b8",
    textHardSecondary: "#ffffff",
    buttonPrimary: "#369eff",
    buttonPrimaryHover: "#2563eb",
    buttonPrimaryText: "#e2e8f0",
    input: "#1e293b",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
