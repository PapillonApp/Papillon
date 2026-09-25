import { error } from "../logger/logger";
import { appFetch } from "@/utils/network/fetch";

function extractCityName(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
  return "";
}

export async function GeographicReverse(lat: number, lon: number): Promise<GeoInfo> {
  try {
    let retries = 3;
    let res: Response = new Response();

    while (retries > 0) {
      res = await appFetch(
        `https://data.geopf.fr/geocodage/reverse?lat=${lat}&lon=${lon}&limit=1&index=parcel,poi,address`
      );

      if (res.ok) {
        break;
      }

      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Request rejected. Status: ${res.status}`);
      }

      retries--;

      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Failed after 3 retries. Status: ${res.status}`);
      }
    }


    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const response = await res.json();

    const feature = response?.features?.[0];
    const city = extractCityName(feature?.properties?.city);
    if (!city || !feature?.properties?.postcode) {
      throw new Error(JSON.stringify(feature));
    }

    return {
      city,
      postalCode: Number(feature.properties.postcode),
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    };

  } catch (err) {
    throw error(String(err), "GeographicReverse");
  }
}

export async function GeographicQuerying(q: string, retry = 3): Promise<GeoInfo> {
  try {
    let retries = retry;
    let res: Response = new Response();

    while (retries > 0) {
      res = await appFetch(
        `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}`
      );

      if (res.ok) {
        break;
      }

      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Request rejected. Status: ${res.status}`);
      }

      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Failed after 3 retries. Status: ${res.status}`);
      }
    }

    const response = await res.json();

    const feature = response?.features?.[0];
    const city = extractCityName(feature?.properties?.city);
    if (!city || !feature?.properties?.postcode) {
      throw new Error(JSON.stringify(feature));
    }

    return {
      city,
      postalCode: Number(feature.properties.postcode),
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    };

  } catch (err) {
    throw error(String(err), "GeographicQuerying");
  }
}

export async function GeographicSearchCities(q: string, retry = 3): Promise<GeoSearchCityInfo[]> {
  try {
    let retries = retry;
    let res: Response = new Response();

    while (retries > 0) {
      res = await appFetch(
        `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}`
      );

      if (res.ok) {
        break;
      }

      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Request rejected. Status: ${res.status}`);
      }

      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Failed after 3 retries. Status: ${res.status}`);
      }
    }

    const response: unknown = await res.json();
    const features = (response as { features?: unknown } | null)?.features;
    if (!Array.isArray(features)) return [];

    return features.flatMap((rawFeature: any) => {
      const properties = rawFeature?.properties;
      const coordinates = rawFeature?.geometry?.coordinates;
      const city = extractCityName(properties?.city);
      const postalCode = Number(properties?.postcode);
      const longitude = Number(coordinates?.[0]);
      const latitude = Number(coordinates?.[1]);
      if (!city || !Number.isFinite(postalCode) || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return [];
      }

      return [{
        id: String(properties?.banId ?? properties?.citycode ?? `${city}-${postalCode}`),
        city,
        citycode: String(properties?.citycode ?? ""),
        context: String(properties?.context ?? ""),
        importance: Number(properties?.score) || 0,
        postalCode,
        longitude,
        latitude,
      }];
    });
  } catch (err) {
    throw error(String(err), "GeographicSearchCities");
  }
}

export interface GeoInfo {
  city: string;
  postalCode: number;
  latitude: number;
  longitude: number;
}

export interface GeoSearchCityInfo {
  id: string;
  city: string;
  citycode: string;
  context: string;
  importance: number;
  postalCode: number;
  latitude: number;
  longitude: number;
}
