import { canOpenURL } from "expo-linking";
import * as Location from "expo-location";

import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { TransportAddress, TransportStorage } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";

export const initializeTransport = async (address: string | undefined): Promise<TransportStorage> => {
  let defaultApp = 'google_maps'; //We use Google Maps because it's a weblink !

  for (const service of AvailableTransportServices) {
    try {
      if (await canOpenURL(service.baseUrlScheme)) {
        defaultApp = service.id;
        break;
      }
    } catch (error) {
      log(`Can't open a transport app: ${service.baseUrlScheme}`);
    }
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  let schoolAddress: TransportAddress | undefined = undefined;

  if (address !== undefined && address !== null && permission.granted) {
    const geocodes = await Location.geocodeAsync(address);
    if (geocodes.length > 0) {
      const geocode = geocodes[0];
      schoolAddress = {
        firstTitle: address,
        secondTitle: "",
        address,
        longitude: geocode.longitude,
        latitude: geocode.latitude
      };
    }
  }

  return {
    enabled: permission.granted,
    defaultApp,
    homeAddress: {
      firstTitle: "current_location",
      secondTitle: "current_location",
      address: "current_location",
      longitude: -1,
      latitude: -1,
    },
    schoolAddress,
  };
}
