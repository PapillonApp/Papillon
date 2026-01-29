import { Papicons } from '@getpapillon/papicons';
import { LegendList } from '@legendapp/list';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { useSettingsStore } from '@/stores/settings';
import { checkConsent } from '@/utils/logger/consent';

import HomeHeader from './atoms/HomeHeader';
import HomeTopBar from './atoms/HomeTopBar';
import Wallpaper from './atoms/Wallpaper';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useHomeData } from './hooks/useHomeData';
import HomeGradesWidget from './widgets/Grades';
import HomeTasksWidget from './widgets/Tasks';
import HomeTimeTableWidget from './widgets/timetable';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();

  // Account
  const accounts = useAccountStore((state) => state.accounts);
  const router = useRouter();

  React.useEffect(() => {
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
    }

    if (accounts.length > 0) {
      checkConsent().then(consent => {
        if (!consent.given) {
          router.push("../consent");
        }
      });
    }
  }, [accounts.length]);

  useHomeData();

  const settingsStore = useSettingsStore(state => state.personalization);
  const disabledWidgets = settingsStore?.disabledWidgets || [];

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderTasks = React.useCallback(() => <HomeTasksWidget />, []);
  const renderGrades = React.useCallback(() => <HomeGradesWidget />, []);

  const data: HomeWidgetItem[] = useMemo(() => [
    {
      icon: <Papicons name={"Calendar"} />,
      title: t("Home_Widget_NextCourses"),
      redirect: "(tabs)/calendar",
      enabled: !disabledWidgets.includes("calendar"),
      render: renderTimeTable
    },
    {
      icon: <Papicons name={"Grades"} />,
      title: t("Home_Widget_NewGrades"),
      redirect: "(tabs)/grades",
      enabled: !disabledWidgets.includes("grades"),
      render: renderGrades
    },
    {
      icon: <Papicons name={"Tasks"} />,
      title: t("Home_Widget_NewTasks"),
      redirect: "(tabs)/tasks",
      enabled: !disabledWidgets.includes("tasks"),
      render: renderTasks
    }

  ], [renderTimeTable, renderTasks, renderGrades, disabledWidgets]);

  return (
    <>
      <Wallpaper />
      <HomeTopBar />

      <LegendList
        renderItem={({ item }) => <HomeWidget item={item} />}
        keyExtractor={(item) => item.title}

        ListHeaderComponent={<HomeHeader />}
        style={{ flex: 1 }}

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
          paddingBottom: insets.bottom + bottomTabBarHeight,
          paddingHorizontal: 16,
          gap: 16
        }}
        data={data.filter(item => item.enabled)}
      />
    </>
  );
};

export default HomeScreen;