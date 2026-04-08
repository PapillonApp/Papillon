import { useTheme } from "@react-navigation/native";
import { Platform, PlatformColor, View } from "react-native";

export default function AndroidHeaderBackground() {
  if(Platform.OS !== "android") return null;
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, elevation: 4 }} />
  )
}

export const AndroidHeaderProps = {
  headerBackVisible: Platform.select({ android: false, default: true }),
  headerBackground: AndroidHeaderBackground
}
