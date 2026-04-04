import {
  DarkTheme as NativeDarkTheme,
  DefaultTheme as NativeDefaultTheme,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { getDynamicColorScheme } from "react-native-dynamic-theme";

const FALLBACK_COLORS = {
  light: {
    primary: "#29947A",
    tint: "#29947A",
    background: "#FFFFFF",
    text: "#000000",
    card: "#FFFFFF",
    item: Platform.OS === "android" ? "#f1f1f1" : "#FFFFFF",
  },
  dark: {
    primary: "#29947A",
    tint: "#29947A",
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
    const scheme = getDynamicColorScheme('#29947A');
    return {
      light: {
        primary: scheme.light.primary,
        tint: scheme.light.primary,
        background: scheme.light.surfaceContainer,
        text: scheme.light.onBackground,
        card: scheme.light.surfaceDim,
        item: scheme.light.surfaceContainerLowest,
      },
      dark: {
        primary: scheme.dark.primaryContainer,
        tint: scheme.dark.primary,
        background: scheme.dark.background,
        text: scheme.dark.onBackground,
        card: scheme.dark.surfaceContainer,
        item: scheme.dark.surfaceContainer,
      },
    };
  }

  return FALLBACK_COLORS;
}

export function createDefaultTheme(useMaterialYou: boolean, primaryColor: string) {
  const colors = getThemeColors(useMaterialYou);

  return {
    ...NativeDefaultTheme,
    colors: {
      ...NativeDefaultTheme.colors,
      primary: useMaterialYou ? colors.light.primary : (primaryColor || colors.light.primary),
      tint: colors.light.tint,
      background: colors.light.background,
      overground: "#F3F6F7",
      text: colors.light.text,
      card: colors.light.card,
      item: colors.light.item,
    },
  };
}

export function createDarkTheme(useMaterialYou: boolean, primaryColor: string) {
  const colors = getThemeColors(useMaterialYou);

  return {
    ...NativeDarkTheme,
    colors: {
      ...NativeDarkTheme.colors,
      primary: useMaterialYou ? colors.dark.primary : (primaryColor || colors.dark.primary),
      tint: colors.dark.tint,
      background: colors.dark.background,
      overground: "#1E1E1E",
      text: colors.dark.text,
      card: colors.dark.card,
      item: colors.dark.item,
    },
  };
}
