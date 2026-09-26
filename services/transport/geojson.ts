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

  for (const leg of itinerary.legs) {
    if (!leg.geometry || leg.geometry.length < 2) {
      continue;
    }
    features.push({
      type: "Feature",
      properties:
        leg.type === "walk"
          ? { kind: "walk", color: "#8E8E93" }
          : { kind: "transit", color: leg.line.color ?? "#0059DD" },
      geometry: {
        type: "LineString",
        coordinates: leg.geometry.map(({ lat, lon }): Position => [lon, lat]),
      },
    });
  }

  if (features.length === 0) {
    return undefined;
  }

  const positions = features.flatMap(feature => feature.geometry.coordinates as Position[]);
  const lons = positions.map(([lon]) => lon);
  const lats = positions.map(([, lat]) => lat);
  const firstLine = features[0]!.geometry.coordinates as Position[];
  const lastLine = features[features.length - 1]!.geometry.coordinates as Position[];

  return {
    collection: { type: "FeatureCollection", features },
    bounds: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
    start: firstLine[0]!,
    end: lastLine[lastLine.length - 1]!,
  };
}
