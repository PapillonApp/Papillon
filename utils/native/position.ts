import * as Location from "expo-location";
import { isWindows } from "../platform";
import { warn } from "../logger/logger";

export interface CurrentPosition {
  longitude: number
  latitude: number
}

export const getCurrentPosition = async (): Promise<CurrentPosition | null> => {
  if (isWindows) {
    warn("Location API is not available on Windows.");
    return null;
  }

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

export const calculateDistanceBetweenPositions = (lat1: number, lon1: number, lat2: number, lon2:number) => {
  const r = 6371e3; // metres
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1)*Math.PI/180;
  const da = (lon2-lon1)*Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(da/2) * Math.sin(da/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return r * c;
}