import React from 'react';
import Wallpaper from './atoms/Wallpaper';
import HomeHeader from './atoms/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeTopBar from './atoms/HomeTopBar';
import HomeTimeTableWidget from './widgets/timetable';
import { Papicons } from '@getpapillon/papicons';
import { t } from 'i18next';
import { LegendList } from '@legendapp/list';
import { useHomeData } from './hooks/useHomeData';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  useHomeData();

  const data: HomeWidgetItem[] = [
    {
      icon: <Papicons name={"Calendar"} />,
      title: t("Home_Widget_NextCourses"),
      redirect: "(tabs)/calendar",
      render: () => <HomeTimeTableWidget />
    },
  ];

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
          paddingBottom: insets.bottom,
          paddingHorizontal: 16,
        }}
        data={data}
      />
    </>
  );
};

export default HomeScreen;