import React, { useState } from "react";
import { useEffect } from "react";
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import TotalMissed from "../../Attendance/Atoms/TotalMissed";
import { PressableScale } from "react-native-pressable-scale";
import RedirectButton from "@/components/Home/RedirectButton";
import { PapillonNavigation } from "@/router/refs";
import type { Attendance } from "@/services/shared/Attendance";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import { updateAttendanceInCache, updateAttendancePeriodsInCache } from "@/services/attendance";
import PapillonLoading from "@/components/Global/PapillonLoading";


interface AttendanceElementProps {
  onImportance: (value: number) => unknown
}

const AttendanceElement: React.FC<AttendanceElementProps> = ({ onImportance }) => {
  const account = useCurrentAccount((store) => store.account);
  const defaultPeriod = useAttendanceStore((store) => store.defaultPeriod) as string | null;
  const attendances = useAttendanceStore((store) => store.attendances) as Record<string, Attendance> | null;

  const [loading, setLoading] = useState(false);

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
      if (account?.instance) {
        setLoading(true);
        await updateAttendancePeriodsInCache(account);
        if (defaultPeriod) {
          await updateAttendanceInCache(account, defaultPeriod);
        }
        setLoading(false);
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

  if (loading) {
    return (
      <>
        <>
          <NativeListHeader animated label="Vie scolaire"
            trailing={(
              <RedirectButton navigation={PapillonNavigation.current} redirect="Attendance" />
            )}
          />
          <NativeList
            animated
            key="loadingAttendance"
            entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
            exiting={FadeOut.duration(300)}
          >
            <NativeItem animated style={{ paddingVertical: 10 }}>
              <PapillonLoading
                title="Chargement de la vie scolaire"
              />
            </NativeItem>
          </NativeList>
        </>
      </>
    );
  }

  if (!totalMissed || totalMissed.absences.length === 0) {
    return (
      <>
        <NativeListHeader label={"Vie scolaire"}
          trailing={(
            <RedirectButton navigation={PapillonNavigation.current} redirect="Attendance" />
          )}
        />
        <NativeList
          animated
          key="emptyAttendance"
          entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
          exiting={FadeOut.duration(300)}
        >
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem
              title="Aucune absence"
              description={
                defaultPeriod
                  ? `Tu n'as pas d'absences au ${defaultPeriod}.`
                  : "Tu n'as pas d'absences pour cette période."
              }
              emoji="🎉"
            />
          </NativeItem>
        </NativeList>
      </>
    );
  }

  return (
    <>
      <NativeListHeader label={"Vie scolaire"}
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Attendance" />
        )}
      />
      <PressableScale
        onPress={() => PapillonNavigation.current?.navigate("Attendance")}
      >
        {totalMissed && <TotalMissed totalMissed={formatTotalMissed(totalMissed)} />}
      </PressableScale>
    </>
  );
};

export default AttendanceElement;
