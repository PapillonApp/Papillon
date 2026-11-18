import {
  DarkTheme as NativeDarkTheme,
  DefaultTheme as NativeDefaultTheme,
} from "expo-router/react-navigation";
import { Platform } from "react-native";
import { getDynamicColorScheme } from "react-native-dynamic-theme";

const FALLBACK_COLORS = {
  light: {
    primary: "#29947A",
    tint: "#29947A",
    background: "#FFFFFF",
    overground: "#F3F6F7",
    text: "#000000",
    card: "#FFFFFF",
    item: Platform.OS === "android" ? "#f1f1f1" : "#FFFFFF",
  },
  dark: {
    primary: "#29947A",
    tint: "#29947A",
    background: "#000000",
    overground: "#000000",
    text: "#FFFFFF",
    card: "#121212",
    item: "#121212",
  },
};

const isMaterialYouAvailable =
  Platform.OS === "android" && typeof Platform.Version === "number" && Platform.Version >= 31;

type ThemeColorSet = typeof FALLBACK_COLORS;

let cachedDynamicColors: ThemeColorSet | null = null;

function getThemeColors(useMaterialYou: boolean): ThemeColorSet {
  if (useMaterialYou && isMaterialYouAvailable) {
    if (!cachedDynamicColors) {
      const scheme = getDynamicColorScheme('#29947A');
      cachedDynamicColors = {
        light: {
          primary: scheme.light.primary,
          tint: scheme.light.primary,
          background: scheme.light.surfaceContainer,
          overground: scheme.light.surfaceContainer,
          text: scheme.light.onBackground,
          card: scheme.light.surfaceDim,
          item: scheme.light.surfaceContainerLowest,
        },
        dark: {
          primary: scheme.dark.primaryContainer,
          tint: scheme.dark.primary,
          background: scheme.dark.background,
          overground: scheme.dark.background,
          text: scheme.dark.onBackground,
          card: scheme.dark.surfaceContainer,
          item: scheme.dark.surfaceContainer,
        },
      };
    }

    return cachedDynamicColors;
  }

  return FALLBACK_COLORS;
}

function buildTheme(
  baseTheme: typeof NativeDefaultTheme,
  palette: ThemeColorSet["light"],
  useMaterialYou: boolean,
  primaryColor: string
) {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: useMaterialYou ? palette.primary : (primaryColor || palette.primary),
      tint: useMaterialYou ? palette.tint : (primaryColor || palette.tint),
      background: palette.background,
      overground: palette.overground,
      text: palette.text,
      card: palette.card,
      item: palette.item,
    },
  };
}

export function createDefaultTheme(useMaterialYou: boolean, primaryColor: string) {
  const colors = getThemeColors(useMaterialYou);
  return buildTheme(NativeDefaultTheme, colors.light, useMaterialYou, primaryColor);
}

export function createDarkTheme(useMaterialYou: boolean, primaryColor: string) {
  const colors = getThemeColors(useMaterialYou);
  return buildTheme(NativeDarkTheme, colors.dark, useMaterialYou, primaryColor);
}
