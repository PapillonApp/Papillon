import { Platform } from "react-native";

export const runsIOS26 = () => {
  return (Platform.OS === "ios" && parseInt(Platform.Version) >= 26);
}