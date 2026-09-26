import * as Linking from "expo-linking";
import type { Attribution } from "papillon-transport";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import Typography from "@/ui/new/Typography";

const ROUTING_ATTRIBUTION: Attribution[] = [
  { text: "Transitous", url: "https://transitous.org/sources/" },
  { text: "© OpenStreetMap contributors", url: "https://www.openstreetmap.org/copyright" },
];

const MAP_ATTRIBUTION: Attribution = {
  text: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
  url: "https://openfreemap.org",
};

export function AttributionFooter() {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 4, paddingVertical: 16 }}>
      <Typography variant="caption" color="textSecondary">{t("Transport_Data_Sources")}</Typography>
      {[...ROUTING_ATTRIBUTION, MAP_ATTRIBUTION].map(item => (
        <Pressable key={item.url} onPress={() => Linking.openURL(item.url)}>
          <Typography variant="caption" color="primary">{item.text}</Typography>
        </Pressable>
      ))}
    </View>
  );
}
