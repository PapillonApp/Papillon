import { Papicons } from "@getpapillon/papicons";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { AttributionFooter } from "@/components/transport/AttributionFooter";
import { ItineraryMap } from "@/components/transport/ItineraryMap";
import { ItinerarySteps } from "@/components/transport/ItinerarySteps";
import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { clock, minutes } from "@/services/transport/format";
import { deserialize } from "@/services/transport/serialize";
import type { CommuteDirection } from "@/services/transport/types";
import { useAccountStore } from "@/stores/account";
import { useTransportStore } from "@/stores/transport";
import Icon from "@/ui/components/Icon";
import { useSafeHorizontalPadding } from "@/ui/hooks/useSafeHorizontalPadding";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

export default function ItineraryModal() {
  const { key, itineraryId, direction } = useLocalSearchParams<{
    key: string;
    itineraryId: string;
    direction: CommuteDirection;
  }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const padding = useSafeHorizontalPadding(16);
  const entry = useTransportStore(state => state.entries[key]);
  const transport = useAccountStore(
    state => state.accounts.find(a => a.id === state.lastUsedAccount)?.transport
  );

  const itineraries = useMemo(
    () =>
      (deserialize(entry?.itineraries) ?? [])
        .filter(itinerary => !itinerary.cancelled)
        .sort((a, b) => a.departure.getTime() - b.departure.getTime()),
    [entry]
  );
  const [selectedId, setSelectedId] = useState(itineraryId);
  const selected = itineraries.find(i => i.id === selectedId) ?? itineraries[0];

  if (!selected) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.overground }}>
        <Typography variant="body1" align="center">{t("Transport_Expired")}</Typography>
      </View>
    );
  }

  const service = AvailableTransportServices.find(s => s.id === (transport?.defaultApp ?? "google_maps"));
  const home = transport?.homeAddress;
  const school = transport?.schoolAddress;
  const openInApp =
    service && home && school
      ? () => {
        const isDeparture = direction === "departure";
        const url = service.generateDeeplink(isDeparture ? home : school, isDeparture ? school : home);
        Linking.openURL(url);
      }
      : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <ItineraryMap itinerary={selected} style={{ height: height * 0.4 }} />
      <ScrollView contentContainerStyle={{ padding: 16, ...padding, gap: 12 }}>
        <Typography variant="h5">
          {t("Transport_Itinerary_Summary", {
            departure: clock(selected.departure, i18n.language),
            arrival: clock(selected.arrival, i18n.language),
            minutes: minutes(selected.durationSeconds),
          })}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t("Transport_Transfers", { count: selected.transfers })}
          {selected.realtime ? ` · ${t("Transport_Realtime")}` : ""}
        </Typography>

        {itineraries.length > 1 ? (
          <View style={{ gap: 6 }}>
            <Typography variant="caption" color="textSecondary">{t("Transport_Other_Times")}</Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {itineraries.map(itinerary => {
                const active = itinerary.id === selected.id;
                return (
                  <Pressable
                    key={itinerary.id}
                    onPress={() => setSelectedId(itinerary.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: active ? colors.primary : String(colors.text) + "10",
                    }}
                  >
                    <Typography variant="body2" color={active ? "#FFFFFF" : "textPrimary"}>
                      {clock(itinerary.departure, i18n.language)}
                    </Typography>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <List>
          <ItinerarySteps itinerary={selected} direction={direction} />
          {openInApp && service ? (
            <List.Section>
              <List.Item onPress={openInApp}>
                <List.Leading>
                  <Icon>
                    <Papicons name="MapPin" />
                  </Icon>
                </List.Leading>
                <Typography variant="title">{t("Transport_Open_In_App", { app: service.name })}</Typography>
                <List.Trailing>
                  <Papicons name="ArrowRight" fill={String(colors.text)} opacity={0.5} />
                </List.Trailing>
              </List.Item>
            </List.Section>
          ) : null}
        </List>

        <AttributionFooter />
      </ScrollView>
    </View>
  );
}
