import { useTheme } from "@react-navigation/native";
import {UserX, Timer, Eye, Scale, LucideIcon, Clock8} from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";

import { error as log_error } from "@/utils/logger/logger";
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
    handlePress: () => {
      if (account?.personalization.widgets?.deleteAfterRead) {
        setTimeout(() => setHidden(true), 3000);
      }
      return "Attendance";
    }
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
    ].sort((a, b) => a.date > b.date ? 0 : -1);
    return events.length > 0 ? events[events.length - 1] : null;
  }, [attendance]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateAttendanceInCache(account, defaultPeriod);
      } catch (error) {
        log_error(`Erreur lors de la mise à jour de la vie scolaire : ${error}`, "Widget:LastAttendanceEvent");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [account, setLoading]);


  useEffect(() => {
    const maxEventAge = account?.personalization.widgets?.maxEventAge || 5;
    const eventAge = Math.round((new Date().getTime() - (lastEvent?.date.getTime() || 0)) / (24 * 60 * 60 * 1000));
    const shouldHide = !lastEvent || !account?.personalization.widgets?.lastAttendanceEvent || eventAge > maxEventAge;
    setHidden(shouldHide);
  }, [lastEvent, setHidden]);

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
        {lastEvent ? <lastEvent.icon size={20} color={colors.text}/> : <Timer/>}
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          {lastEvent?.name}
        </Text>
      </View>
      <View style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: "auto",
      }}>
        {lastEvent?.number && <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            // marginTop: 15,
            gap: 4,
          }}>

          <AnimatedNumber
            value={Number(lastEvent?.number || "0").toFixed(1)}
            style={{
              fontSize: 30,
              lineHeight: 30,
              fontFamily: "semibold",
              color: lastEvent?.justified ? colors.text : "#D10000",
            }}
            contentContainerStyle={{
              paddingLeft: 4,
            }}
          />
          <Text
            style={{
              color: lastEvent?.justified ? colors.text + "50" : "#D1000050",
              fontFamily: "semibold",
              fontSize: 20,
            }}
          >
            {lastEvent.unit}
          </Text>
        </View>}
        {!lastEvent?.justified && <View
          style={{
            backgroundColor: "#D10000",
            marginTop: 12,
            marginRight: 2,
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderRadius: 4
          }}>
          <NativeText
            numberOfLines={1}
            variant="body"
            color="#fff"
          >
            {lastEvent?.number ? "Non justifié" : "À justifier"}
          </NativeText>
        </View>}
        <NativeText
          variant="title"
          style={{
            width: "100%",
          }}
          numberOfLines={1}
        >
          {lastEvent?.description}
        </NativeText>
      </View>

      <View
        style={{
          marginTop: "auto",
          display: "flex",
          width: "50%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 5
        }}
      >
        <Clock8 opacity={0.7} size={17} color={colors.text}/>
        <NativeText
          numberOfLines={1}
          variant="subtitle"
        >
          {formatDate(lastEvent?.date.toString() || "")}
        </NativeText>
      </View>
    </>
  );
});

export default LastAttendanceEventWidget;
