// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Platform } from "react-native";
import { ScreenProps } from "react-native-screens";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const screenOptions: any = {
  headerLargeTitle: true,
  headerTransparent: Platform.OS === "ios" && parseInt(Platform.Version) >= 26,
  headerTitleStyle: {
    fontFamily: "semibold",
    fontSize: 18,
  },
  headerLargeTitleStyle: {
    fontFamily: "bold",
  },
  headerBackTitleStyle: {
    fontFamily: "semibold",
    fontSize: 17,
  },
};
