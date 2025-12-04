import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
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
import HomeTimeTableWidget from './widgets/timetable';
import Reanimated, { LayoutAnimationConfig, LinearTransition } from 'react-native-reanimated';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { Animation } from '@/ui/utils/Animation';
import Icon from '@/ui/components/Icon';
import Typography from '@/ui/components/Typography';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { SplashScreen, useRouter } from 'expo-router';
import { Papicons } from '@getpapillon/papicons';
import { t } from 'i18next';
import { FlashList } from '@shopify/flash-list';
import { LegendList } from '@legendapp/list';
import FakeSplash from '@/components/FakeSplash';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const alert = useAlert();

  const router = useRouter();

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

      <LegendList
        renderItem={({ item }) => {
          if (!item || (item.dev && !__DEV__)) {
            return null;
          }

          return (
            <Stack card radius={25} gap={0} style={{ paddingBottom: 3 }}>
              <Stack direction="horizontal" vAlign="center" hAlign="center" padding={[10, 10]} gap={10} style={{ marginTop: -1 }}>
                <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
                  {item.icon}
                </Icon>
                <Typography nowrap style={{ flex: 1, opacity: 0.6 }} variant="title" color="text">
                  {item.title}
                </Typography>
                {(item.redirect || item.onPress) && (
                  <AnimatedPressable
                    onPress={() => item.onPress ? item.onPress() : router.navigate(item.redirect)}
                  >
                    <Stack bordered direction="horizontal" hAlign="center" padding={[12, 6]} gap={6}>
                      <Typography variant="body2" color="secondary" inline>
                        {item.buttonLabel ?? "Afficher plus"}
                      </Typography>
                      <Icon size={20} papicon opacity={0.5}>
                        <Papicons name={"ArrowRightUp"} />
                      </Icon>
                    </Stack>
                  </AnimatedPressable>
                )}
              </Stack>
              {item.render && item.render()}
            </Stack>
          )
        }}

        keyExtractor={(item) => item.title}

        ListHeaderComponent={<HomeHeader />}

        style={{
          flex: 1,
        }}

        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingHorizontal: 16,
        }}

        data={
          [
            {
              icon: <Papicons name={"Calendar"} />,
              title: t("Home_Widget_NextCourses"),
              redirect: "(tabs)/calendar",
              render: () => <HomeTimeTableWidget />
            },
          ]
        }
      />
    </>
  );
};

export default HomeScreen;