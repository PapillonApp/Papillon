import { Platform, PlatformColor, View } from "react-native";

export default function AndroidHeaderBackground() {
  if(Platform.OS !== "android") return null;
  return (
    <View style={{ flex: 1, backgroundColor: PlatformColor("?attr/colorSurface"), elevation: 4 }} />
  )
}

export const AndroidHeaderProps = {
  headerBackVisible: Platform.select({ android: false, default: true }),
  headerBackground: AndroidHeaderBackground
}
