import { error } from "../logger/logger";

export async function GeographicReverse(lat: number, lon: number): Promise<GeoInfo> {
  try {
    const res = await fetch(
      `https://data.geopf.fr/geocodage/reverse?lat=${lat}&lon=${lon}&limit=1&index=parcel,poi,address`
    );

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const response = await res.json();

    const feature = response?.features?.[0];
    if (!feature?.properties?.city || !feature?.properties?.postcode) {
      throw new Error(JSON.stringify(feature));
    }

    return {
      city: feature.properties.city[0],
      postalCode: Number(feature.properties.postcode),
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    };

  } catch (err) {
    error(String(err))
  }
}

export async function GeographicQuerying(q: string): Promise<GeoInfo> {
  try {
    const res = await fetch(
      `https://data.geopf.fr/geocodage/search?q=${q}`
    );

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const response = await res.json();

    const feature = response?.features?.[0];
    if (!feature?.properties?.city || !feature?.properties?.postcode) {
      throw new Error(JSON.stringify(feature));
    }

    return {
      city: feature.properties.city[0],
      postalCode: Number(feature.properties.postcode),
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    };

  } catch (err) {
    error(String(err))
  }
}

export interface GeoInfo {
  city: string;
  postalCode: number;
  latitude: number;
  longitude: number;
}
