import { useTheme } from "@react-navigation/native";
import {UserX, Timer, Eye, Scale, LucideIcon} from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import { NativeText } from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import formatDate from "@/utils/format/format_date_complets";
import {useAttendanceStore} from "@/stores/attendance";
import {useGradesStore} from "@/stores/grades";
import {updateAttendanceInCache} from "@/services/attendance";
import AnimatedNumber from "@/components/Global/AnimatedNumber";

type AttendanceEvent = {
  name: string
  icon: LucideIcon
  number?: string
  unit: string
  description: string
  date: Date
  justified: boolean
};

const LastAttendanceEventWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const attendance = useAttendanceStore((store) => store.attendances);
  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);

  useImperativeHandle(ref, () => ({
    handlePress: () => "Attendance"
  }));

  const lastEvent = useMemo(() => {
    if (!attendance || !defaultPeriod || !attendance[defaultPeriod]) return null;
    const periodAttendance = attendance[defaultPeriod];
    const events: AttendanceEvent[] = [
      ...periodAttendance.absences.map(absence => {
        return {
          name: "Absence",
          icon: UserX,
          number: absence.hours.split("h")[0],
          unit: "h",
          description: absence.reasons || "Raison inconnue",
          date: new Date(absence.fromTimestamp),
          justified: absence.justified
        };
      }),
      ...periodAttendance.delays.map(delay => {
        return {
          name: "Retard",
          icon: Timer,
          number: delay.duration.toString(),
          unit: "min",
          description: delay.reasons || "Raison inconnue",
          date: new Date(delay.timestamp),
          justified: delay.justified
        };
      }),
      ...periodAttendance.observations.map(observation => {
        return {
          name: "Observation",
          icon: Eye,
          unit: "h",
          description: observation.reasons || "Raison inconnue",
          date: new Date(observation.timestamp),
          justified: observation.shouldParentsJustify
        };
      }),
      ...periodAttendance.punishments.map(punishment => {
        return {
          name: "Punition",
          icon: Scale,
          number: punishment.duration.toString(),
          unit: "min",
          description: punishment.reason.circumstances || "Raison inconnue",
          date: new Date(punishment.timestamp),
          justified: true
        };
      })
    ].sort((a, b) => a.date > b.date ? -1 : 0);
    return events.length > 0 ? events[events.length - 2] : null;
  }, [attendance]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateAttendanceInCache(account, defaultPeriod);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la vie scolaire :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [account, setLoading]);


  useEffect(() => {
    const maxEventAge = account?.personalization.widgets?.maxEventAge || 5;
    const eventAge = Math.round(Math.abs((Number(new Date()) - Number(lastEvent?.date)) / 24 * 60 * 60 * 1000));
    const shouldHide = !lastEvent || !account?.personalization.widgets?.lastAttendanceEvent || eventAge >= maxEventAge;
    // setHidden(shouldHide);
    setHidden(false);
  }, [lastEvent, setHidden]);

  if (!lastEvent) {
    return null;
  }

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <lastEvent.icon size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          {lastEvent.name}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          marginTop: 15,
          gap: 4,
        }}>

        <AnimatedNumber
          value={Number(lastEvent.number || "0").toFixed(1)}
          style={{
            fontSize: 24.5,
            lineHeight: 24,
            fontFamily: "semibold",
            color: colors.text,
          }}
          contentContainerStyle={{
            paddingLeft: 6,
          }}
        />
        <Text
          style={{
            color: colors.text + "50",
            fontFamily: "semibold",
            fontSize: 15,
          }}
        >
          {lastEvent.unit}
        </Text>
      </View>

      <Reanimated.View
        style={{
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "auto",
          gap: 2,
        }}
        layout={LinearTransition}
      >

        <NativeText
          variant="title"
          style={{
            width: "100%",
          }}
          numberOfLines={1}
        >
          {lastEvent.description}
        </NativeText>
      </Reanimated.View>
      <View
        style={{
          display: "flex",
          width: "100%",
          marginTop: 5,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <NativeText
          numberOfLines={1}
          variant="subtitle"
        >
          {formatDate(lastEvent.date.toString())}
        </NativeText>
        {!lastEvent.justified && <NativeText
          numberOfLines={1}
          variant="subtitle"
          style={{
            color: "#D10000"
          }}
        >
          Non justifié
        </NativeText>}
      </View>
    </>
  );
});

export default LastAttendanceEventWidget;
