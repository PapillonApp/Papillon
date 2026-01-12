import React, { useMemo } from 'react';
import Wallpaper from './atoms/Wallpaper';
import HomeHeader from './atoms/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeTopBar from './atoms/HomeTopBar';
import { Papicons } from '@getpapillon/papicons';
import { t } from 'i18next';
import { LegendList } from '@legendapp/list';
import { useHomeData } from './hooks/useHomeData';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/stores/account';
import HomeAverageWidget from './widgets/Average';
import HomeTasksWidget from './widgets/Tasks';
import HomeTimeTableWidget from './widgets/timetable';
import HomeGradesWidget from './widgets/Grades';

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
  }, [accounts.length]);

  useHomeData();

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderTasks = React.useCallback(() => <HomeTasksWidget />, []);
  const renderGrades = React.useCallback(() => <HomeGradesWidget />, []);

  // const renderAverage = React.useCallback(() => <HomeAverageWidget />, []);

  const data: HomeWidgetItem[] = useMemo(() => [
    {
      icon: <Papicons name={"Calendar"} />,
      title: t("Home_Widget_NextCourses"),
      redirect: "(tabs)/calendar",
      render: renderTimeTable
    },
    {
      icon: <Papicons name={"Tasks"} />,
      title: t("Tab_Tasks"),
      redirect: "(tabs)/tasks",
      render: renderTasks
    },
    {
      icon: <Papicons name={"Grades"} />,
      title: t("Latest_Grades"),
      redirect: "(tabs)/grades",
      render: renderGrades
    },

    // {
    //   icon: <Papicons name={"Grades"} />,
    //   title: t("Grades_Avg_All_Title"),
    //   redirect: "(tabs)/grades",
    //   render: renderAverage
    // },
  ], [renderTimeTable, renderTasks]);

  return (
    <>
      <Wallpaper />
      <HomeTopBar />

      <LegendList
        renderItem={({ item }) => <HomeWidget item={item} />}
        keyExtractor={(item) => item.title}

        ListHeaderComponent={<HomeHeader />}
        style={{ flex: 1 }}

        contentContainerStyle={{
          paddingBottom: insets.bottom + bottomTabBarHeight,
          paddingHorizontal: 16,
          gap: 12
        }}
        data={data}
      />
    </>
  );
};

export default HomeScreen;