import { error } from "../logger/logger";

export async function GeographicReverse(lat: number, lon: number): Promise<GeoInfo> {
  try {
    let retries = 3;
    let res: Response = new Response();

    while (retries > 0) {
      res = await fetch(
        `https://data.geopf.fr/geocodage/reverse?lat=${lat}&lon=${lon}&limit=1&index=parcel,poi,address`
      );

      if (res.ok) {
        break;
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

export async function GeographicQuerying(q: string, retry = 3): Promise<GeoInfo> {
  try {
    let retries = retry;
    let res: Response = new Response();

    while (retries > 0) {
      res = await fetch(
        `https://data.geopf.fr/geocodage/search?q=${q}`
      );

      if (res.ok) {
        break;
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
