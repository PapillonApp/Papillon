import { Platform } from "react-native"; // Keep Platform for Platform.Version
import { isIOS } from "@/utils/platform";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const screenOptions: any = {
  headerLargeTitle: true,
  headerTransparent: isIOS && parseInt(Platform.Version as string, 10) >= 26,
  headerBackButtonDisplayMode:
    isIOS && parseInt(Platform.Version as string, 10) < 26
      ? undefined
      : "minimal",
  headerTitleStyle: {
    fontFamily: "semibold",
    fontSize: isIOS ? 18 : 20,
  },
  headerLargeTitleStyle: {
    fontFamily: "bold",
  },
  headerBackTitleStyle: {
    fontFamily: "semibold",
    fontSize: 17,
  },
};
