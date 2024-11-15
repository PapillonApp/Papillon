import React from "react";
import { useEffect } from "react";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { updateGradesPeriodsInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import TotalMissed from "../../Attendance/Atoms/TotalMissed";
import { PressableScale } from "react-native-pressable-scale";
import RedirectButton from "@/components/Home/RedirectButton";
import { PapillonNavigation } from "@/router/refs";
import { log } from "@/utils/logger/logger";
import type { Attendance } from "@/services/shared/Attendance";


interface AttendanceElementProps {
  onImportance: (value: number) => unknown
}

const AttendanceElement: React.FC<AttendanceElementProps> = ({ onImportance }) => {
  const account = useCurrentAccount((store) => store.account);
  const defaultPeriod = useAttendanceStore((store) => store.defaultPeriod) as string | null;
  const attendances = useAttendanceStore((store) => store.attendances) as Record<string, Attendance> | null;

  const ImportanceHandler = () => {
    if (attendances && defaultPeriod) {
      const totalMissed = formatTotalMissed(attendances[defaultPeriod]);
      if (totalMissed.total.hours > 0 || totalMissed.total.minutes > 0) {
        onImportance(3);
      } else {
        onImportance(0);
      }
    } else {
      onImportance(0);
    }
  };

  useEffect(() => {
    void (async () => {
      log("update grades periods in cache", "attendance:updateGradesPeriodsInCache");
      if (account?.instance) {
        await updateGradesPeriodsInCache(account);
      }
      ImportanceHandler();
    })();
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
    }, 0) + data.delays.reduce((sum, delay) => {
      const [hours, minutes] = [Math.floor(delay.duration / 60), delay.duration % 60];
      return sum + hours + (minutes || 0) / 60;
    }, 0);;

    const unJustifiedHours = data.absences.reduce((sum, absence) => {
      if (!absence.justified) {
        const [hours, minutes] = absence.hours.split("h").map(Number);
        return sum + hours + (minutes || 0) / 60;
      }
      return sum;
    }, 0) + data.delays.reduce((sum, delay) => {
      if (!delay.justified) {
        const [hours, minutes] = [Math.floor(delay.duration / 60), delay.duration % 60];
        return sum + hours + (minutes || 0) / 60;
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
