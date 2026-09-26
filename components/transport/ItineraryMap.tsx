import { Camera, GeoJSONSource, Layer, Map, Marker } from "@maplibre/maplibre-react-native";
import { useTheme } from "expo-router/react-navigation";
import type { Itinerary } from "papillon-transport";
import React, { useMemo } from "react";
import { View, type ViewStyle } from "react-native";

import { geojson } from "@/services/transport/geojson";

export const OPENFREEMAP_LIGHT = "https://tiles.openfreemap.org/styles/positron";
export const OPENFREEMAP_DARK = "https://tiles.openfreemap.org/styles/dark";

const EDGE_PADDING = { top: 48, right: 32, bottom: 32, left: 32 };

function EndpointMarker({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: "#FFFFFF",
      }}
    />
  );
}

export function ItineraryMap({ itinerary, style }: { itinerary: Itinerary; style?: ViewStyle }) {
  const { dark, colors } = useTheme();
  const geo = useMemo(() => geojson(itinerary), [itinerary]);

  if (!geo) {
    return null;
  }

  return (
    <Map
      style={style}
      mapStyle={dark ? OPENFREEMAP_DARK : OPENFREEMAP_LIGHT}
      logo={false}
      compass={false}
      attribution
    >
      <Camera key={itinerary.id} initialViewState={{ bounds: geo.bounds, padding: EDGE_PADDING }} />
      <GeoJSONSource id="itinerary" data={geo.collection}>
        <Layer
          id="itinerary-walk"
          type="line"
          filter={["==", ["get", "kind"], "walk"]}
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": ["get", "color"], "line-width": 4, "line-dasharray": [0.5, 2] }}
        />
        <Layer
          id="itinerary-transit"
          type="line"
          filter={["==", ["get", "kind"], "transit"]}
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": ["get", "color"], "line-width": 6 }}
        />
      </GeoJSONSource>
      <Marker lngLat={geo.start}>
        <EndpointMarker color={String(colors.text)} />
      </Marker>
      <Marker lngLat={geo.end}>
        <EndpointMarker color={String(colors.primary)} />
      </Marker>
    </Map>
  );
}
