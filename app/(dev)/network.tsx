import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";

import Disclosure from "@/components/Devmode/Disclosure";
import { useNetworkStore } from "@/stores/logs";
import Stack from "@/ui/components/Stack";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const HOSTS: Record<string, { title: string; icon: string }> = {
  "index-education": { title: "PRONOTE", icon: "Pronote" },
  "ecoledirecte.com": { title: "École Directe", icon: "Ecoledirecte" },
  "api.skolengo.com": { title: "Skolengo", icon: "Skolengo" },
  "analytics.papillon.bzh": { title: "Télémétrie", icon: "PapillonIcon" },
  "github.com": { title: "Ressources", icon: "Code" },
  "geopf.fr": { title: "Localisation", icon: "MapPin" },
  "raw.githubusercontent.com": { title: "GitHub", icon: "Code" },
};

export default function Network() {
  const { colors } = useTheme();
  const hosts = useNetworkStore(state => state.hosts);

  const entries = useMemo(
    () =>
      Array.from(hosts.entries())
        .map(([origin, host]) => {
          const url = new URL(origin);
          const match = Object.entries(HOSTS).find(([key]) => url.host.toLowerCase().includes(key));
          return {
            origin,
            url,
            count: host.requests.length,
            title: match?.[1].title ?? url.host,
            icon: match?.[1].icon ?? "Globe",
          };
        })
        .sort((a, b) => b.count - a.count),
    [hosts]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {entries.length === 0 ? (
          <List.View id="empty">
            <Stack gap={6} hAlign="center" style={{ paddingVertical: 40 }}>
              <Papicons name="Globe" color={String(colors.text) + "66"} />
              <Typography variant="body1" color="textSecondary" align="center">
                Aucune requête depuis le lancement.
              </Typography>
            </Stack>
          </List.View>
        ) : (
          <List.Section id="hosts">
            <List.SectionTitle>
              <Papicons name="Globe" color={String(colors.text) + "88"} />
              <List.Label>{`${entries.length} serveur${entries.length > 1 ? "s" : ""}`}</List.Label>
            </List.SectionTitle>
            {entries.map(entry => {
              const secure = entry.url.protocol === "https:";
              return (
                <List.Item
                  key={entry.origin}
                  id={entry.origin}
                  href={{ pathname: "/(dev)/requests", params: { host: entry.origin } }}
                >
                  <List.Leading>
                    <Papicons name={entry.icon} color={String(colors.text)} opacity={0.8} />
                  </List.Leading>
                  <Typography variant="action" numberOfLines={1}>
                    {entry.title}
                  </Typography>
                  <Stack direction="horizontal" hAlign="center" gap={4}>
                    <Papicons name={secure ? "Lock" : "Unlock"} size={14} color={secure ? "#6BAE00" : "#C50017"} />
                    <Typography variant="body2" color="textSecondary" numberOfLines={1}>
                      {secure ? entry.url.host : `${entry.url.host} · non chiffré`}
                    </Typography>
                  </Stack>
                  <List.Trailing>
                    <Disclosure value={entry.count} />
                  </List.Trailing>
                </List.Item>
              );
            })}
          </List.Section>
        )}
      </List>
    </View>
  );
}
