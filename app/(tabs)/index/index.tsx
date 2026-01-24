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
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/stores/account';
import { checkConsent } from '@/utils/logger/consent';

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
      <LegendList
        renderItem={({ item }) => <HomeWidget item={item} />}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={<HomeHeader />}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + bottomTabBarHeight,
          paddingHorizontal: 16,
        }}
        data={data}
      />
    </>
  );
};

export default HomeScreen;