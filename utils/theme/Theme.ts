import {
  DarkTheme as NativeDarkTheme,
  DefaultTheme as NativeDefaultTheme,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { getDynamicColorScheme } from "react-native-dynamic-theme";

const FALLBACK_COLORS = {
  light: {
    primary: "#29947A",
    background: "#FFFFFF",
    text: "#000000",
    card: "#FFFFFF",
    item: "#FFFFFF",
  },
  dark: {
    primary: "#29947A",
    background: "#000000",
    text: "#FFFFFF",
    card: "#121212",
    item: "#121212",
  },
};

const isMaterialYouAvailable =
  Platform.OS === "android" && typeof Platform.Version === "number" && Platform.Version >= 31;

function getThemeColors(useMaterialYou: boolean) {
  if (useMaterialYou && isMaterialYouAvailable) {
    const scheme = getDynamicColorScheme();
    return {
      light: {
        primary: scheme.light.primary,
        background: scheme.light.background,
        text: scheme.light.onBackground,
        card: scheme.light.surface,
        item: scheme.light.surfaceContainerHigh,
      },
      dark: {
        primary: scheme.dark.primary,
        background: scheme.dark.background,
        text: scheme.dark.onBackground,
        card: scheme.dark.surfaceContainer,
        item: scheme.dark.surfaceContainer,
      },
    };
  }

  return FALLBACK_COLORS;
}

export function createDefaultTheme(useMaterialYou: boolean) {
  const colors = getThemeColors(useMaterialYou);

  return {
    ...NativeDefaultTheme,
    colors: {
      ...NativeDefaultTheme.colors,
      primary: colors.light.primary,
      background: colors.light.background,
      overground: "#F3F6F7",
      text: colors.light.text,
      card: colors.light.card,
      item: colors.light.item,
    },
  };
}

export function createDarkTheme(useMaterialYou: boolean) {
  const colors = getThemeColors(useMaterialYou);

  return {
    ...NativeDarkTheme,
    colors: {
      ...NativeDarkTheme.colors,
      primary: colors.dark.primary,
      background: colors.dark.background,
      overground: "#1E1E1E",
      text: colors.dark.text,
      card: colors.dark.card,
      item: colors.dark.item,
    },
  };
}
