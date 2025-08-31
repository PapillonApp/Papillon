import { Platform } from "react-native";

export const runsIOS26 = () => {
  return false;
  // return (Platform.OS === "ios" && parseInt(Platform.Version) >= 26);
}