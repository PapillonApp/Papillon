import * as Location from "expo-location";

export interface CurrentPosition {
  longitude: number
  latitude: number
}

export const getCurrentPosition = async (): Promise<CurrentPosition | null> => {
  try {
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

export interface LocationPermission {
  timestamp: number
  granted: boolean
  canAskAgain: boolean
}

export const getLocationPermission = async (): Promise<LocationPermission> => {
  const permission = await Location.getForegroundPermissionsAsync();

  return {
    timestamp: Date.now(),
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  };
};

export const requestLocationPermission = async (): Promise<LocationPermission> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  return {
    timestamp: Date.now(),
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  };
};
