import type React from "react";
import { useEffect } from "react";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { updateGradesPeriodsInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import TotalMissed from "../../Attendance/Atoms/TotalMissed";
import { PressableScale } from "react-native-pressable-scale";
import { useTheme } from "@react-navigation/native";
import RedirectButton from "@/components/Home/RedirectButton";
import { PapillonNavigation } from "@/router/refs";
import { log } from "@/utils/logger/logger";
import type { Attendance } from "@/services/shared/Attendance";

const AttendanceElement: React.FC = () => {
  const account = useCurrentAccount((store) => store.account);
  const defaultPeriod = useAttendanceStore((store) => store.defaultPeriod) as string | null;
  const attendances = useAttendanceStore((store) => store.attendances) as Record<string, Attendance> | null;

  const theme = useTheme();
  const { colors } = theme;

  useEffect(() => {
    void (async () =>{
      log("update grades periods in cache", "attendance:updateGradesPeriodsInCache");
      if (account?.instance) {
        await updateGradesPeriodsInCache(account);
      }
    } );
  }, [account?.instance]);

  const totalMissed = attendances && defaultPeriod ? attendances[defaultPeriod] : null;

  const formatTotalMissed = (data: Attendance | null) => {
    if (!data) {
      return {
        total: { hours: 0, minutes: 0 },
        unJustified: { hours: 0, minutes: 0 }
      };
    }

    const totalHours = data.absences.reduce((sum, absence) => {
      const [hours, minutes] = absence.hours.split("h").map(Number);
      return sum + hours + (minutes || 0) / 60;
    }, 0) + data.delays.reduce((sum, delays) => {
      return sum + (delays.duration || 0) / 60;
    }, 0);

    const unJustifiedHours = data.absences.reduce((sum, absence) => {
      if (!absence.justified) {
        const [hours, minutes] = absence.hours.split("h").map(Number);
        return sum + hours + (minutes || 0) / 60;
      }
      return sum;
    }, 0) + data.delays.reduce((sum, delays) => {
      if (!delays.justified) {
        return sum + (delays.duration || 0) / 60;
      }
      return sum;
    }, 0);

    return {
      total: {
        hours: Math.floor(totalHours),
        minutes: Math.round((totalHours % 1) * 60),
      },
      unJustified: {
        hours: Math.floor(unJustifiedHours),
        minutes: Math.round((unJustifiedHours % 1) * 60),
      },
    };
  };

  if (!totalMissed || totalMissed.absences.length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader label={`Vie scolaire — ${defaultPeriod}`}
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Attendance" />
        )}
      />
      <PressableScale
        onPress={() => PapillonNavigation.current.navigate("Attendance")}
      >
        {totalMissed && <TotalMissed totalMissed={formatTotalMissed(totalMissed)} />}
      </PressableScale>
    </>
  );
};

export default AttendanceElement;
