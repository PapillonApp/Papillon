import { Platform } from "react-native";

export const AvailableTransportServices = [
  {
    id: "transit",
    name: "Transit",
    icon: require(`@/assets/images/transport/transit.png`),
  },
  Platform.OS === "ios" && {
    id: "apple_maps",
    name: "Apple Maps",
    icon: require(`@/assets/images/transport/apple_maps.png`),
  },
  {
    id: "google_maps",
    name: "Google Maps",
    icon: require(`@/assets/images/transport/google_maps.png`),
  },
].filter(Boolean) as Array<{
  id: string;
  name: string;
  icon: any;
}>;