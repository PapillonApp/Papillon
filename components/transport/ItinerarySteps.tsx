import { Papicons } from "@getpapillon/papicons";
import type { Itinerary, PlaceKind } from "papillon-transport";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { clock } from "@/services/transport/format";
import { steps } from "@/services/transport/steps";
import type { CommuteDirection } from "@/services/transport/types";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

import { LineBadge } from "./LineBadge";

const LATE_COLOR = "#E8901C";

const WALK_KEYS: Partial<Record<PlaceKind, Record<CommuteDirection, string>>> = {
  destination: {
    departure: "Transport_Walk_To_School",
    return: "Transport_Walk_To_Home",
  },
};

export function ItinerarySteps({ itinerary, direction }: { itinerary: Itinerary; direction: CommuteDirection }) {
  const { t, i18n } = useTranslation();
  const list = steps(itinerary);

  return (
    <List.Section>
      <List.SectionTitle>
        <List.Label>{t("Transport_Steps")}</List.Label>
      </List.SectionTitle>
      {list.map((step, index) => {
        if (step.kind === "walk") {
          const label = t(WALK_KEYS[step.toKind]?.[direction] ?? (step.toName ? "Transport_Walk_To" : "Transport_Walk"), { minutes: step.minutes, place: step.toName });
          return (
            <List.Item key={`walk-${index}`}>
              <List.Leading>
                <Icon>
                  <Papicons name="Walk" />
                </Icon>
              </List.Leading>
              <Typography variant="title">{step.isTransfer ? t("Transport_Transfer") : label}</Typography>
              {step.isTransfer ? (
                <Typography variant="body2" color="textSecondary">{label}</Typography>
              ) : null}
            </List.Item>
          );
        }

        return (
          <List.Item key={`transit-${index}`}>
            <List.Leading>
              <LineBadge line={step.line} />
            </List.Leading>
            <Typography variant="title" numberOfLines={1}>
              {step.headsign ? t("Transport_Direction", { headsign: step.headsign }) : step.line.longName ?? ""}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`${clock(step.departure, i18n.language)} ${step.fromName ?? ""}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`${clock(step.arrival, i18n.language)} ${step.toName ?? ""}`}
            </Typography>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Typography variant="caption" color="textSecondary">
                {t("Transport_Stops_Count", { count: step.stopCount })}
              </Typography>
              {step.cancelled ? (
                <Typography variant="caption" color={LATE_COLOR}>{t("Transport_Cancelled")}</Typography>
              ) : step.realtime && step.delayMinutes > 0 ? (
                <Typography variant="caption" color={LATE_COLOR}>
                  {t("Transport_Delay", { minutes: step.delayMinutes })}
                </Typography>
              ) : null}
            </View>
          </List.Item>
        );
      })}
    </List.Section>
  );
}
