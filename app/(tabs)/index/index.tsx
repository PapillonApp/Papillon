import { Papicons } from '@getpapillon/papicons';
import { useIsFocused } from "expo-router/react-navigation";
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { FlatList, Image, Platform, StatusBar, View } from 'react-native';
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
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import Icon from '@/ui/components/Icon';
import Button from '@/ui/new/Button';
import { ListTouchable } from '@/ui/new/List';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = insets.bottom + 16;
  const focused = useIsFocused();

  // Account
  const store = useAccountStore();
  const accounts = useAccountStore((state) => state.accounts);
  const account = accounts.find(a => a.id === store.lastUsedAccount);
  const recordTeamModalHomeLaunch = useAccountStore(state => state.recordTeamModalHomeLaunch);
  const dismissTeamWidget = useAccountStore(state => state.dismissTeamWidget);
  const router = useRouter();
  const welcomeModalSeen = useSettingsStore(state => state.personalization.welcomeModalSeen);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);
  const countedTeamModalAccount = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
      return;
    }

    if (account && account.transport === undefined) {
      store.initializeTransport(account.schoolName);
    }
  }, [account, accounts.length, router, store]);

  React.useEffect(() => {
    checkConsent().then(consent => {
      if (!consent.given) {
        router.push("../consent");
      }
    });
  }, []);

  React.useEffect(() => {
    if (!account?.id || countedTeamModalAccount.current === account.id) {
      return;
    }

    countedTeamModalAccount.current = account.id;
    if (recordTeamModalHomeLaunch(account.id)) {
      router.navigate("/(modals)/team");
    }
  }, [account?.id, recordTeamModalHomeLaunch, router]);

  useHomeData();
  const { courses } = useTimetableWidgetData();
  const timetableTitle = useTimetableWidgetTitle(courses);

  const [gradesWidgetHidden, setGradesWidgetHidden] = React.useState(true);

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderGrades = React.useCallback(
    () => <GradesWidget onEmptyStateChange={setGradesWidgetHidden} />,
    []
  );
  const renderTeam = React.useCallback(
    () => (
      <ListTouchable onPress={() => router.navigate("/(modals)/team")} style={{ width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: "hidden" }}>
      <Stack direction="horizontal" hAlign='center'>
        <MaskedView
          style={{ width: "35%", height: 110 }}
          maskElement={
            <LinearGradient
              colors={["#000", "#0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: "100%", height: "100%" }}
            />
          }
        >
        <Image
          source={require('@/assets/images/team.jpg')}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
        />
        </MaskedView>
      <View style={{ flex: 1, paddingRight: 16, justifyContent: "center", gap: 3 }}>
        <Typography variant="body1" weight="bold" color="textPrimary">
          Rejoignez la communauté !
        </Typography>
        <Typography variant="body2" style={{ opacity: 0.5 }}>
          Suivez les nouveautés et fonctionnalités développés par nos soins.
        </Typography>
      </View>
      </Stack>
      </ListTouchable>
    ),
    []
  );

  const data: HomeWidgetItem[] = React.useMemo(() => [
    {
      icon: <Papicons name="User" />,
      title: "Derrière Papillon",
      hidden: !account?.teamModal?.shown || account.teamModal.widgetDismissed === true,
      onDismiss: account
        ? () => dismissTeamWidget(account.id)
        : undefined,
      render: renderTeam,
    },
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
  ], [account, courses.length, dismissTeamWidget, gradesWidgetHidden, renderGrades, renderTeam, renderTimeTable, timetableTitle]);

  const visibleWidgets = React.useMemo(
    () => data.filter(item => !item.hidden && (!item.dev || __DEV__)),
    [data]
  );
  const allWidgetsHidden = visibleWidgets.length === 0;

  React.useEffect(() => {
    if (!account || welcomeModalSeen) {
      return;
    }

    mutateSettings("personalization", { welcomeModalSeen: true });
    router.navigate("/(modals)/welcome");
  }, [account, mutateSettings, router, welcomeModalSeen]);

  return (
    <>
      <Wallpaper />
      <HomeTopBar />
      {focused && <StatusBar translucent animated barStyle={'light-content'} />}
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
