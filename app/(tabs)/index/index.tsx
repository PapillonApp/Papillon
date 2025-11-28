import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import Wallpaper from './atoms/Wallpaper';
import HomeHeader from './atoms/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './atoms/UserProfile';
import HomeTopBar from './atoms/HomeTopBar';
import { getManager, initializeAccountManager, subscribeManagerUpdate } from "@/services/shared";
import { useAlert } from '@/ui/components/AlertProvider';
import { log, warn } from '@/utils/logger/logger';
import { getWeekNumberFromDate } from '@/database/useHomework';
import { Homework } from '@/services/shared/homework';
import { generateId } from '@/utils/generateId';
import { Grade, Period } from '@/services/shared/grade';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { useSettingsStore } from '@/stores/settings';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const alert = useAlert();

  const settingsstore = useSettingsStore(state => state.personalization)

  const Initialize = async () => {
    try {
      await initializeAccountManager()
      log("Refreshed Manager received")

      await Promise.all([fetchEDT(), fetchGrades()]);

      if (settingsstore.showAlertAtLogin) {
        alert.showAlert({
          title: "Synchronisation réussie",
          description: "Toutes vos données ont été mises à jour avec succès.",
          icon: "CheckCircle",
          color: "#00C851",
          withoutNavbar: true,
          delay: 1000
        });
      }

    } catch (error) {
      if (String(error).includes("Unable to find")) { return; }
      alert.showAlert({
        title: "Connexion impossible",
        description: "Il semblerait que ta session a expiré. Tu pourras renouveler ta session dans les paramètres en liant à nouveau ton compte.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error)
      })
    }
  };

  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    const date = new Date();
    const weekNumber = getWeekNumberFromDate(date)
    await manager.getWeeklyTimetable(weekNumber)
  }, []);

  const fetchGrades = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping grades fetch');
      return;
    }
    const gradePeriods = await manager.getGradesPeriods()
    const validPeriods: Period[] = []
    const date = new Date().getTime()
    for (const period of gradePeriods) {
      if (period.start.getTime() > date && period.end.getTime() > date) {
        validPeriods.push(period);
      }
    }

    const grades: Grade[] = []
    const currentPeriod = getCurrentPeriod(validPeriods)

    const periodGrades = await manager.getGradesForPeriod(currentPeriod, currentPeriod.createdByAccount)
    periodGrades.subjects.forEach(subject => {
      subject.grades.forEach(grade => {
        grades.push(grade);
      });
    });

  }, [])

  useMemo(() => {
    Initialize();
  }, []);

  return (
    <>
      <Wallpaper />

      <HomeTopBar />

      <FlatList
        data={[]}
        renderItem={({ item }) => <View />}
        keyExtractor={(item, index) => index.toString()}

        ListHeaderComponent={<HomeHeader />}

        style={{
          flex: 1,
        }}

        contentContainerStyle={{
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom,
        }}
      />
    </>
  );
};

export default HomeScreen;