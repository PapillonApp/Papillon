import { Papicons } from '@getpapillon/papicons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { FlatList, StatusBar } from 'react-native';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { checkConsent } from '@/utils/logger/consent';

import HomeHeader from './atoms/HomeHeader';
import HomeTopBar from './atoms/HomeTopBar';
import Wallpaper from './atoms/Wallpaper';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useHomeData } from './hooks/useHomeData';
import HomeTimeTableWidget from './widgets/timetable';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const focused = useIsFocused();

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

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);

  const data: HomeWidgetItem[] = React.useMemo(() => [
    {
      icon: <Papicons name={"Calendar"} />,
      title: t("Home_Widget_NextCourses"),
      redirect: "(tabs)/calendar",
      render: renderTimeTable
    },
  ], [renderTimeTable]);

  return (
    <>
      <Wallpaper />
      <HomeTopBar />
      {focused && <StatusBar translucent animated barStyle={'light-content'} />}
      <FlatList
        renderItem={({ item }) => <HomeWidget item={item} />}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={<HomeHeader />}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + bottomTabBarHeight,
          paddingHorizontal: 16,
          flexGrow: 1
        }}
        data={data}
      />
    </>
  );
};

export default HomeScreen;