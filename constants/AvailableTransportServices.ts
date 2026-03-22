import { Platform } from "react-native";

import { TransportAddress } from "@/stores/account/types";

export const AvailableTransportServices = [
  {
    id: "transit",
    name: "Transit",
    icon: require(`@/assets/images/transport/transit.png`),
    generateDeeplink: (
      from: TransportAddress,
      to: TransportAddress,
      isDeparture: boolean,
      targetTime: number
    ): string => {
      return `transit://directions?from=${from.firstTitle === "current_location" ? "" : `${from.address}`}&to=${to.address}&${isDeparture ? `arrive_by=${targetTime}` : `leave_at=${targetTime}`}`;
    },
  },
  Platform.OS === "ios" && {
    id: "apple_maps",
    name: "Apple Maps",
    icon: require(`@/assets/images/transport/apple_maps.png`),
    generateDeeplink: (
      from: TransportAddress,
      to: TransportAddress,
      isDeparture: boolean,
      targetTime: number
    ): string => {
      // Apple Maps don't support time in URL... :(
      return `maps://?${from.firstTitle === "current_location" ? '' : `saddr=${from.latitude},${from.longitude}&`}daddr=${to.latitude},${to.longitude}`;
    },
  },
  {
    id: "google_maps",
    name: "Google Maps",
    icon: require(`@/assets/images/transport/google_maps.png`),
    generateDeeplink: (
      from: TransportAddress,
      to: TransportAddress,
      isDeparture: boolean,
      targetTime: number
    ): string => {
      // Google too, what the f*ck ??
      return `https://www.google.com/maps/dir/?api=1&${from.firstTitle === "current_location" ? "" : `origin=${from.latitude},${from.longitude}&`}destination=${to.latitude},${to.longitude}`;
    },
  },
].filter(Boolean) as Array<{
  id: string;
  name: string;
  icon: any;
  generateDeeplink: (
    from: TransportAddress,
    to: TransportAddress,
    isDeparture: boolean,
    targetTime: number
  ) => string;
}>;