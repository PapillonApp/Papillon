import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const screenOptions: any = {
  headerLargeTitle: true,
  headerTransparent: Platform.OS === "ios" && parseInt(Platform.Version) >= 26,
  headerBackButtonDisplayMode:
    Platform.OS === "ios" && parseInt(Platform.Version) < 26
      ? undefined
      : "minimal",
  headerTitleStyle: {
    fontFamily: "semibold",
    fontSize: Platform.OS === "ios" ? 18 : 20,
  },
  headerLargeTitleStyle: {
    fontFamily: "bold",
  },
  headerBackTitleStyle: {
    fontFamily: "semibold",
    fontSize: 17,
  },
};
