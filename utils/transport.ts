import { TransportAddress, TransportStorage } from "@/stores/account/types";
import { canOpenURL } from "expo-linking";
import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { log } from "@/utils/logger/logger";
import Transit from "@/services/transit";
import * as Location from "expo-location";

export const initializeTransport = async (address: string | undefined): Promise<TransportStorage> => {
  let defaultApp = 'google_maps'; //We use Google Maps because it's a weblink !
  const transit = new Transit();

  for (const service of AvailableTransportServices) {
    try {
      if (await canOpenURL(service.baseUrlScheme)) {
        defaultApp = service.baseUrlScheme;
        break;
      }
    } catch (error) {
      log(`Can't open a transport app: ${service.baseUrlScheme}`);
    }
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  let schoolAddress: TransportAddress | undefined = undefined;

  if (address !== undefined && address !== null && permission.granted) {
    const currentLocation = await Location.getCurrentPositionAsync();
    const result = await transit.suggestions(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      address
    );

    if (result.suggestions.places.length > 0) {
      const place = result.suggestions.places[0];
      const geocode = await transit.locationDetails(place.place_id);

      schoolAddress = {
        firstTitle: place.structured_formatting.main_text,
        secondTitle: place.structured_formatting.secondary_text,
        address: geocode.placeDetails.result.formatted_address,
        longitude: geocode.placeDetails.result.geometry.location.lng,
        latitude: geocode.placeDetails.result.geometry.location.lat
      };
    }
  }

  return {
    enabled: permission.granted,
    defaultApp,
    homeAddress: {
      firstTitle: "current_position",
      secondTitle: "current_position",
      address: "current_position",
      longitude: -1,
      latitude: -1,
    },
    schoolAddress,
  };
}