export async function GeographicReverse(lat: number, lon: number): Promise<GeoInfo> {
  console.log("Fetching reverse geocoding...");

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
    };

  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch geolocation data");
  }
}

export interface GeoInfo {
  city: string;
  postalCode: number;
}
