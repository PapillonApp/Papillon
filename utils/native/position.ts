import * as Location from "expo-location";

export interface CurrentPosition {
  longitude: number
  latitude: number
}

export const getCurrentPosition = async (): Promise<CurrentPosition | null> => {
  try {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) {
      return null
    }
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

    return {
      longitude: coords.longitude,
      latitude: coords.latitude
    };
  }
  catch {
    return null;
  }
};