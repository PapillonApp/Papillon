import {useTheme} from "@react-navigation/native";
import React, {useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Platform, RefreshControl, View} from "react-native";

import type {Screen} from "@/router/helpers/types";
import {useCurrentAccount} from "@/stores/account";
import {useAttendanceStore} from "@/stores/attendance";
import {updateAttendanceInCache, updateAttendancePeriodsInCache} from "@/services/attendance";
import {NativeText} from "@/components/Global/NativeComponents";
import Reanimated, {FadeIn, FadeOut, LinearTransition} from "react-native-reanimated";
import PapillonPicker from "@/components/Global/PapillonPicker";
import {ChevronDown, Eye, Scale, Timer, UserX} from "lucide-react-native";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import {animPapillon} from "@/utils/ui/animations";
import AttendanceItem from "./Atoms/AttendanceItem";
import {getAbsenceTime} from "@/utils/format/attendance_time";
import TotalMissed from "./Atoms/TotalMissed";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import {protectScreenComponent} from "@/router/helpers/protected-screen";
import {Observation} from "@/services/shared/Observation";
import MissingItem from "@/components/Global/MissingItem";
import {hasFeatureAccountSetup} from "@/utils/multiservice";
import {MultiServiceFeature} from "@/stores/multiService/types";
import {AccountService} from "@/stores/account/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

const Attendance: Screen<"Attendance"> = ({ route, navigation }) => {
  const theme = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const { isOnline } = useOnlineStatus();

  const hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Attendance, account.localID) : true;

  const defaultPeriod = useAttendanceStore(store => store.defaultPeriod);
  const periods = useAttendanceStore(store => store.periods);
  const attendances = useAttendanceStore(store => store.attendances);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setLoading] = useState(hasServiceSetup);

  useEffect(() => {
    if (!isOnline && isLoading) {
      setLoading(false);
    }
  }, [isOnline, isLoading]);

  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(null);
  const selectedPeriod = useMemo(() => userSelectedPeriod ?? defaultPeriod, [userSelectedPeriod, defaultPeriod]);

  useEffect(() => {
    updateAttendancePeriodsInCache(account);
  }, [navigation, account.instance]);

  useEffect(() => {
    setIsRefreshing(false);
  }, [attendances]);

  useEffect(() => {
    void async function () {
      if (!selectedPeriod) return;

      setLoading(true);
      await updateAttendanceInCache(account, selectedPeriod);
      setLoading(false);
    }();
  }, [selectedPeriod]);

  const attendances_observations_details = useMemo(() => {
    if (!attendances[selectedPeriod]) return {};

    return attendances[selectedPeriod].observations.reduce((acc, observation) => {
      if (observation.sectionName in acc) {
        acc[observation.sectionName].push(observation);
      }
      else {
        acc[observation.sectionName] = [observation];
      }

      return acc;
    }, {} as Record<string, Observation[]>);
  }, [attendances, selectedPeriod]);

  const [totalMissed, setTotalMissed] = useState({
    total: {
      hours: 0,
      minutes: 0
    },
    unJustified: {
      hours: 0,
      minutes: 0
    },
    absence: {
      hours: 0,
      minutes: 0
    },
    delay: {
      hours: 0,
      minutes: 0
    }
  });

  useEffect(() => {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalUnJustifiedHours = 0;
    let totalUnJustifiedMinutes = 0;
    let totalAbsenceHours = 0;
    let totalAbsenceMinutes = 0;
    let totalDelayHours = 0;
    let totalDelayMinutes = 0;

    attendances[selectedPeriod]?.absences.forEach(absence => {
      const missed = getAbsenceTime(absence.fromTimestamp, absence.toTimestamp);

      if (!absence.justified)  {
        totalUnJustifiedHours += parseInt(absence.hours.split("h")[0]);
        totalUnJustifiedMinutes += parseInt(absence.hours.split("h")[1]);
      }

      totalHours += parseInt(absence.hours.split("h")[0]);
      totalMinutes += parseInt(absence.hours.split("h")[1]);

      totalAbsenceHours += parseInt(absence.hours.split("h")[0]);
      totalAbsenceMinutes += parseInt(absence.hours.split("h")[1]);
    });

    attendances[selectedPeriod]?.delays.forEach(delay => {
      const origMins = delay.duration;
      const missed = {
        hours: Math.floor(origMins / 60),
        minutes: origMins % 60
      };

      if (!delay.justified) {
        totalUnJustifiedHours += missed.hours;
        totalUnJustifiedMinutes += missed.minutes;
      }

      totalHours += missed.hours;
      totalMinutes += missed.minutes;

      totalDelayHours += missed.hours;
      totalDelayMinutes += missed.minutes;
    });

    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes = totalMinutes % 60;
    }

    if (totalUnJustifiedMinutes >= 60) {
      totalUnJustifiedHours += Math.floor(totalUnJustifiedMinutes / 60);
      totalUnJustifiedMinutes = totalUnJustifiedMinutes % 60;
    }

    if (totalAbsenceMinutes >= 60) {
      totalAbsenceHours += Math.floor(totalAbsenceMinutes / 60);
      totalAbsenceMinutes = totalAbsenceMinutes % 60;
    }

    if (totalDelayMinutes >= 60) {
      totalDelayHours += Math.floor(totalDelayMinutes / 60);
      totalDelayMinutes = totalDelayMinutes % 60;
    }

    setTotalMissed({
      total: {
        hours: totalHours,
        minutes: totalMinutes
      },
      unJustified: {
        hours: totalUnJustifiedHours,
        minutes: totalUnJustifiedMinutes
      },
      absence: {
        hours: totalAbsenceHours,
        minutes: totalAbsenceMinutes
      },
      delay: {
        hours: totalDelayHours,
        minutes: totalDelayMinutes
      }
    });
  }, [attendances, selectedPeriod]);


  return (
    <>
      <PapillonHeader route={route} navigation={navigation}>
        <Reanimated.View
          layout={LinearTransition}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Reanimated.View
            layout={LinearTransition}
          >
            <PapillonPicker
              delay={0}
              data={periods.map(period => period.name)}
              selected={userSelectedPeriod ?? selectedPeriod}
              onSelectionChange={setUserSelectedPeriod}
              direction="right"
            >
              <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <NativeText style={{ color: theme.colors.primary, maxWidth: 100 }} numberOfLines={1}>
                  {userSelectedPeriod ?? selectedPeriod}
                </NativeText>
                <ChevronDown color={theme.colors.primary} size={24} />
              </View>
            </PapillonPicker>
          </Reanimated.View>

          {isLoading && !isRefreshing &&
            <Reanimated.View
              entering={FadeIn}
              exiting={FadeOut.duration(1000)}
              layout={LinearTransition}
              style={{ marginRight: 6 }}
            >
              <ActivityIndicator color={Platform.OS === "android" ? theme.colors.primary : void 0} />
            </Reanimated.View>
          }
        </Reanimated.View>
      </PapillonHeader>

      <Reanimated.ScrollView
        layout={animPapillon(LinearTransition)}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
          paddingTop: 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            progressViewOffset={70}
            onRefresh={() => {
              setIsRefreshing(true);
              if(account.identityProvider?.identifier) {
                navigation.navigate("BackgroundIdentityProvider");
                updateAttendanceInCache(account, selectedPeriod).then(() => setIsRefreshing(false));
              }
              else {
                updateAttendanceInCache(account, selectedPeriod).then(() => setIsRefreshing(false));
              }
            }}
          />
        }
      >
        <PapillonHeaderInsetHeight route={route} />

        {!isOnline && <OfflineWarning cache={true} />}

        {hasServiceSetup && attendances[selectedPeriod] && attendances[selectedPeriod].absences.length === 0 && attendances[selectedPeriod].delays.length === 0 && attendances[selectedPeriod].punishments.length === 0 && Object.keys(attendances_observations_details).length === 0 &&(
          <MissingItem
            title="Aucune absence"
            description="Tu n'as pas d'absences ni de retards pour cette période."
            emoji="🎉"
            style={{ marginTop: 16 }}
          />
        )}

        {!hasServiceSetup && (
          <MissingItem
            title="Aucun service connecté"
            description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
            emoji="🤷"
            style={{ marginTop: 16 }}
          />
        )}

        {(totalMissed.total.hours > 0 || totalMissed.total.minutes > 0) && (
          <TotalMissed totalMissed={totalMissed} />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].absences.length > 0 && (
          <AttendanceItem
            title="Absences"
            icon={<UserX />}
            attendances={attendances[selectedPeriod].absences}
            missed={totalMissed.absence}
          />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].delays.length > 0 && (
          <AttendanceItem
            title="Retards"
            icon={<Timer />}
            attendances={attendances[selectedPeriod].delays}
            missed={totalMissed.delay}
          />
        )}

        {Object.keys(attendances_observations_details).map(sectionName => (
          <AttendanceItem
            key={sectionName}
            title={sectionName}
            icon={<Eye />}
            attendances={attendances_observations_details[sectionName]}
          />
        ))}

        {attendances[selectedPeriod] && attendances[selectedPeriod].punishments.length > 0 && (
          <AttendanceItem
            title="Punitions"
            icon={<Scale />}
            attendances={attendances[selectedPeriod].punishments}
          />
        )}

        <InsetsBottomView />
      </Reanimated.ScrollView>
    </>
  );
};

export default protectScreenComponent(Attendance);
