import { Papicons } from '@getpapillon/papicons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { FlatList, Platform, StatusBar, View } from 'react-native';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { checkConsent } from '@/utils/logger/consent';

import HomeHeader from './atoms/HomeHeader';
import HomeTopBar from './atoms/HomeTopBar';
import Wallpaper from './atoms/Wallpaper';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useHomeData } from './hooks/useHomeData';
import { useHomeHeaderData } from './hooks/useHomeHeaderData';
import HomeTimeTableWidget from './widgets/timetable';
import GradesWidget from './widgets/Grades';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const focused = useIsFocused();

  // Account
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const initializeTransport = useAccountStore((state) => state.initializeTransport);
  const setLastUsedAccount = useAccountStore((state) => state.setLastUsedAccount);
  const account = React.useMemo(
    () => accounts.find((a) => a.id === lastUsedAccount) ?? null,
    [accounts, lastUsedAccount]
  );
  const consentCheckedAccountRef = React.useRef<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (accounts.length === 0) {
      consentCheckedAccountRef.current = null;
      router.replace("/(onboarding)/welcome");
      return;
    }

    if (!account) {
      setLastUsedAccount(accounts[0].id);
      return;
    }

    if (consentCheckedAccountRef.current !== account.id) {
      consentCheckedAccountRef.current = account.id;
      checkConsent().then((consent) => {
        if (!consent.given) {
          router.push("/consent");
        }
      });
    }

    if (account.transport === undefined) {
      void initializeTransport(account.schoolName);
    }
  }, [account, accounts, initializeTransport, router, setLastUsedAccount]);

  const { isLoading: isHomeLoading } = useHomeData();
  const homeHeaderData = useHomeHeaderData();

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderGrades = React.useCallback(() => <GradesWidget />, []);

  const data: HomeWidgetItem[] = React.useMemo(() => [
    {
      icon: <Papicons name={"Calendar"} />,
      title: t("Home_Widget_NextCourses"),
      redirect: "(tabs)/calendar",
      render: renderTimeTable
    },
    {
      icon: <Papicons name={"Grades"} />,
      title: t("Home_Widget_Grades_Average"),
      redirect: "(tabs)/grades",
      render: renderGrades
    }
  ], [renderTimeTable, renderGrades]);

  const isGlobalLoading = isHomeLoading || homeHeaderData.loadingAttendance;

  return (
    <>
      <Wallpaper />
      <HomeTopBar isLoading={isGlobalLoading} />
      {focused && <StatusBar translucent animated barStyle={'light-content'} />}
      <HomeViewContainer>
        <FlatList
          renderItem={({ item }) => <HomeWidget item={item} />}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={<HomeHeader data={homeHeaderData} />}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? bottomTabBarHeight : 16,
            paddingHorizontal: 16,
            flexGrow: 1,
            gap: 12,
            marginTop: 6
          }}
          data={data}
        />
      </HomeViewContainer>
    </>
  );
};

const HomeViewContainer = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <MaskedView
      maskElement={
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <LinearGradient
            colors={['#ff000022', 'red']}
            locations={[0.5, 1]}
            style={{ height: insets.top + 68 }}
          />
          <View style={{ flex: 1, backgroundColor: 'red' }} />
        </View>
      }
      style={{ flex: 1 }}
    >
      {children}
    </MaskedView>
  )
}

export default HomeScreen;
