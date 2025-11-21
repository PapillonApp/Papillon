import {
  DarkTheme as NativeDarkTheme,
  DefaultTheme as NativeDefaultTheme,
} from "@react-navigation/native";

const PrimaryAccentColor = {
  light: "#29947A",
  dark: "#29947A",
};

export const DefaultTheme = {
  ...NativeDefaultTheme,
  colors: {
    ...NativeDefaultTheme.colors,
    primary: PrimaryAccentColor.light,
    background: "#FFFFFF",
    text: "#000000",
    card: "#FFFFFF",
  },
};

export const DarkTheme = {
  ...NativeDarkTheme,
  colors: {
    ...NativeDarkTheme.colors,
    primary: PrimaryAccentColor.dark,
    background: "#000000",
    text: "#FFFFFF",
    card: "#121212",
  },
};
