import type { FeatureCollection, LineString } from "geojson";
import type { Itinerary } from "papillon-transport";

type Position = [number, number];

export interface ItineraryGeoJSON {
  collection: FeatureCollection<LineString, { kind: "walk" | "transit"; color: string }>;
  bounds: [number, number, number, number];
  start: Position;
  end: Position;
}

export function geojson(itinerary: Itinerary): ItineraryGeoJSON | undefined {
  const features: ItineraryGeoJSON["collection"]["features"] = [];
  const positions: Position[] = [];

  for (const leg of itinerary.legs) {
    if (!leg.geometry || leg.geometry.length < 2) {
      continue;
    }
    const coordinates = leg.geometry.map(({ lat, lon }): Position => [lon, lat]);
    positions.push(...coordinates);
    features.push({
      type: "Feature",
      properties:
        leg.type === "walk"
          ? { kind: "walk", color: "#8E8E93" }
          : { kind: "transit", color: leg.line.color ?? "#0059DD" },
      geometry: {
        type: "LineString",
        coordinates,
      },
    });
  }

  const start = positions[0];
  const end = positions[positions.length - 1];
  if (!start || !end) {
    return undefined;
  }

  const lons = positions.map(([lon]) => lon);
  const lats = positions.map(([, lat]) => lat);

  return {
    collection: { type: "FeatureCollection", features },
    bounds: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
    start,
    end,
  };
}
