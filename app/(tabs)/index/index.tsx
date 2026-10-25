import { Papicons } from '@getpapillon/papicons';
import { useIsFocused } from "expo-router/react-navigation";
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { FlatList, Platform, RefreshControl, StatusBar, View } from 'react-native';
import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { useSettingsStore } from '@/stores/settings';
import { checkConsent } from '@/utils/logger/consent';
import { Animation } from '@/ui/utils/Animation';

import HomeHeader from './atoms/HomeHeader';
import HomeTopBar from './atoms/HomeTopBar';
import Wallpaper from './atoms/Wallpaper';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useHomeData } from './hooks/useHomeData';
import { useTimetableWidgetData } from './hooks/useTimetableWidgetData';
import { useTimetableWidgetTitle } from './hooks/useTimetableWidgetTitle';
import HomeTimeTableWidget from './widgets/timetable';
import GradesWidget from './widgets/Grades';
import { usePeriodsData } from '../grades/hooks/usePeriodsData';
import { useGradesData } from '../grades/hooks/useGradesData';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import Icon from '@/ui/components/Icon';
import Button from '@/ui/new/Button';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = insets.bottom + 16;
  const topBarHeight = insets.top + 56 + (insets.right > 10 ? 10 : 0);
  const focused = useIsFocused();

  // Account
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const initializeTransport = useAccountStore((state) => state.initializeTransport);
  const account = accounts.find(a => a.id === lastUsedAccount);
  const router = useRouter();
  const welcomeModalSeen = useSettingsStore(state => state.personalization.welcomeModalSeen);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);

  React.useEffect(() => {
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
      return;
    }

    if (account && account.transport === undefined) {
      initializeTransport(account.schoolName);
    }
  }, [account, accounts.length, router, initializeTransport]);

  const consentPrompted = React.useRef(false);

  React.useEffect(() => {
    // Only ask for consent once the user lands on home with an account (i.e. after onboarding)
    if (!focused || accounts.length === 0 || consentPrompted.current) {
      return;
    }

    consentPrompted.current = true;
    checkConsent().then(consent => {
      if (!consent.given) {
        router.push("../consent");
      }
    });
  }, [focused, accounts.length, router]);

  const { syncing, refresh } = useHomeData();
  const { courses } = useTimetableWidgetData();
  const timetableTitle = useTimetableWidgetTitle(courses);

  const { currentPeriod } = usePeriodsData();
  const { grades, history, averages, refresh: refreshGrades } = useGradesData(currentPeriod);

  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      // The grades widget keeps its own cache, the timetable reads the database.
      await refreshGrades();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshGrades]);
  const gradesWidgetHidden = grades.length === 0;

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget courses={courses} />, [courses]);
  const renderGrades = React.useCallback(
    () => <GradesWidget history={history} averages={averages} />,
    [history, averages]
  );
  const data: HomeWidgetItem[] = React.useMemo(() => [
    {
      icon: <Papicons name={"Calendar"} />,
      title: timetableTitle,
      redirect: "(tabs)/calendar",
      hidden: courses.length === 0,
      render: renderTimeTable
    },
    {
      icon: <Papicons name={"Grades"} />,
      title: t("Home_Widget_Grades_Average"),
      redirect: "(tabs)/grades",
      hidden: gradesWidgetHidden,
      render: renderGrades
    }
  ], [courses.length, gradesWidgetHidden, renderGrades, renderTimeTable, timetableTitle]);

  const visibleWidgets = React.useMemo(
    () => data.filter(item => !item.hidden && (!item.dev || __DEV__)),
    [data]
  );
  const allWidgetsHidden = visibleWidgets.length === 0;

  React.useEffect(() => {
    if (!account || welcomeModalSeen || !focused) {
      return;
    }

    mutateSettings("personalization", { welcomeModalSeen: true });
    router.navigate("/(modals)/welcome");
  }, [account, focused, mutateSettings, router, welcomeModalSeen]);

  return (
    <>
      <Wallpaper />
      <HomeTopBar loading={syncing} />
      {focused && <StatusBar animated barStyle={'light-content'} />}
      <HomeViewContainer key={"home"}>
        <FlatList
          renderItem={({ item }) => (
            <Reanimated.View layout={Animation(LinearTransition, "list")}>
              <HomeWidget item={item} />
            </Reanimated.View>
          )}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={<HomeHeader />}
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" progressViewOffset={topBarHeight} />}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? bottomTabBarHeight : 16,
            flexGrow: 1,
            gap: 12,
            marginTop: 6,
            width: '100%',
            maxWidth: 700,
            marginHorizontal: 'auto',
            paddingHorizontal: 16,
          }}
          data={visibleWidgets}
          ListFooterComponent={
            <View style={{ gap: 12 }}>
              {allWidgetsHidden && <HomeEmptyState />}
            </View>
          }
        />
      </HomeViewContainer>
    </>
  );
};

const HomeEmptyState = React.memo(() => (
  <Dynamic animated key="home-widgets:empty" style={{ width: "100%" }}>
    <Stack hAlign="center" vAlign="center" flex padding={[22, 16]} gap={2} style={{ width: "100%" }}>
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={"Ghost"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {t("Home_Widgets_Empty_Title")}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {t("Home_Widgets_Empty_Description")}
      </Typography>
    </Stack>
  </Dynamic>
));
HomeEmptyState.displayName = "HomeEmptyState";

const HomeViewContainer = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <MaskedView
      maskElement={
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <LinearGradient
            colors={['#ff000022', 'white']}
            locations={[0.5, 1]}
            style={{ height: insets.top + 68 }}
          />
          <View style={{ flex: 1, backgroundColor: 'white' }} />
        </View>
      }
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      {children}
      </SafeAreaView>
    </MaskedView>
  )
}

const HomeScreenWithBoundary = () => (
  <MainTabErrorBoundary>
    <HomeScreen />
  </MainTabErrorBoundary>
);

export default HomeScreenWithBoundary;
