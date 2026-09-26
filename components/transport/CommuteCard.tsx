import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import type { TransitLeg } from "papillon-transport";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { useCommute } from "@/hooks/useCommute";
import type { Course } from "@/services/shared/timetable";
import { clock, minutes, until } from "@/services/transport/format";
import type { CommuteDirection, CommuteState } from "@/services/transport/types";
import Typography from "@/ui/new/Typography";

import { LineBadge } from "./LineBadge";

const LATE_COLOR = "#E8901C";
const SOON_THRESHOLD_MINUTES = 120;

interface CommuteCardProps {
  day: Date;
  courses: Course[];
  direction: CommuteDirection;
  refreshToken: number;
}

function Dots({ direction }: { direction: CommuteDirection }) {
  const { colors, dark } = useTheme();
  const opacities = dark ? [0.2, 0.25, 0.3] : [0.05, 0.1, 0.2];
  return (
    <View
      style={{
        width: 57,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexDirection: direction === "departure" ? "column" : "column-reverse",
      }}
    >
      {opacities.map(opacity => (
        <View
          key={opacity}
          style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: colors.text, opacity }}
        />
      ))}
    </View>
  );
}

function Skeleton() {
  const { colors } = useTheme();
  const bar = (width: `${number}%`) => (
    <View style={{ height: 12, width, borderRadius: 6, backgroundColor: String(colors.text) + "14" }} />
  );
  return (
    <View style={{ gap: 8 }}>
      {bar("55%")}
      {bar("35%")}
    </View>
  );
}

function ErrorContent({ state }: { state: Extract<CommuteState, { kind: "error" }> }) {
  const { t } = useTranslation();
  const detail =
    state.code === "NETWORK" || state.code === "TIMEOUT"
      ? t("Transport_Unavailable_Offline")
      : state.code === "RATE_LIMITED"
        ? t("Transport_Unavailable_Rate_Limited")
        : state.code === "LOCATION_UNAVAILABLE"
          ? t("Transport_Error_Location_Description")
          : t("Transport_Unavailable_Retry");
  return (
    <>
      <Typography variant="title" numberOfLines={1}>{t("Transport_Unavailable")}</Typography>
      <Typography variant="caption" color="textSecondary" numberOfLines={1}>{detail}</Typography>
    </>
  );
}

function ReadyContent({
  state,
  direction,
}: {
  state: Extract<CommuteState, { kind: "ready" }>;
  direction: CommuteDirection;
}) {
  const { t, i18n } = useTranslation();
  const { itinerary, late, lateMinutes } = state.selection;
  const now = new Date();
  const lines = itinerary.legs
    .filter((leg): leg is TransitLeg => leg.type === "transit")
    .map(leg => leg.line);
  const departure = clock(itinerary.departure, i18n.language);
  const arrival = clock(itinerary.arrival, i18n.language);
  const untilDeparture = until(itinerary.departure, now);

  const title =
    direction === "return"
      ? t("Transport_Return_Summary", { departure, arrival })
      : untilDeparture > 0 && untilDeparture < SOON_THRESHOLD_MINUTES
        ? `${t("Transport_Leave_At_Time", { time: departure })} · ${t("Transport_Leave_In_Minutes", { minutes: untilDeparture })}`
        : t("Transport_Leave_At_Time", { time: departure });

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Typography variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Typography>
        {itinerary.realtime ? (
          <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: "#29947A" }} />
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {lines.map((line, index) => (
          <LineBadge key={`${line.id ?? line.shortName}-${index}`} line={line} />
        ))}
        {direction === "departure" ? (
          late ? (
            <Typography variant="caption" color={LATE_COLOR} numberOfLines={1}>
              {t("Transport_Late", { time: arrival, minutes: lateMinutes })}
            </Typography>
          ) : (
            <Typography variant="caption" color="textSecondary" numberOfLines={1}>
              {t("Transport_Arrival_Summary", {
                time: arrival,
                minutes: minutes(itinerary.durationSeconds),
              })}
            </Typography>
          )
        ) : null}
      </View>
      {state.stale ? (
        <Typography variant="caption" color="textSecondary" numberOfLines={1}>
          {t("Transport_Stale", { time: clock(state.fetchedAt, i18n.language) })}
        </Typography>
      ) : null}
    </>
  );
}

export const CommuteCard = React.memo(function CommuteCard(props: CommuteCardProps) {
  const { state, refresh } = useCommute(props);
  const router = useRouter();
  const { t } = useTranslation();

  if (state.kind === "hidden") {
    return null;
  }

  const onPress = () => {
    switch (state.kind) {
    case "ready":
      router.push({
        pathname: "/(modals)/itinerary",
        params: {
          key: state.cacheKey,
          itineraryId: state.selection.itinerary.id,
          direction: props.direction,
        },
      });
      break;
    case "needs_setup":
      router.navigate("/(settings)/transport");
      break;
    case "permission_denied":
      Linking.openSettings();
      break;
    case "error":
      refresh();
      break;
    default:
      break;
    }
  };

  let content: React.ReactNode;
  switch (state.kind) {
  case "loading":
    content = <Skeleton />;
    break;
  case "ready":
    content = <ReadyContent state={state} direction={props.direction} />;
    break;
  case "needs_setup":
    content = (
      <>
        <Typography variant="title" numberOfLines={1}>
          {state.missing === "home" ? t("Transport_Needs_Home_Address") : t("Transport_Needs_School_Address")}
        </Typography>
        <Typography variant="caption" color="textSecondary" numberOfLines={1}>
          {t("Transport_Needs_Setup_Description")}
        </Typography>
      </>
    );
    break;
  case "permission_denied":
    content = (
      <>
        <Typography variant="title" numberOfLines={1}>{t("Transport_Error_Location_Title")}</Typography>
        <Typography variant="caption" color="textSecondary" numberOfLines={1}>
          {t("Transport_Error_Location_Description")}
        </Typography>
      </>
    );
    break;
  case "empty":
    content = (
      <Typography variant="body2" color="textSecondary" numberOfLines={1}>
        {t("Transport_No_Route")}
      </Typography>
    );
    break;
  case "error":
  default:
    content = <ErrorContent state={state} />;
    break;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={state.kind === "loading" || state.kind === "empty"}
      style={{ minHeight: 60, flexDirection: "row", gap: 12, alignItems: "center" }}
    >
      <Dots direction={props.direction} />
      <View style={{ flex: 1, gap: 4, justifyContent: "center" }}>{content}</View>
    </Pressable>
  );
});
