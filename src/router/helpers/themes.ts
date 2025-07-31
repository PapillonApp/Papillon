import { DefaultTheme, DarkTheme, type Theme } from "@react-navigation/native";

export const PapillonLight: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#29947A",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#d5d5d5",
    notification: "#29947A",
  },
};

export const PapillonDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#29947A",
    background: "#0a0a0a",
    card: "#111111",
    text: "#FFFFFF",
    border: "#252525",
    notification: "#29947A",
  },
};