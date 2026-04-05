import { Papicons } from '@getpapillon/papicons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { FlatList, Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { checkConsent } from '@/utils/logger/consent';

import HomeHeader from './atoms/HomeHeader';
import HomeTopBar from './atoms/HomeTopBar';
import Wallpaper from './atoms/Wallpaper';
import HomeWidget, { HomeWidgetItem } from './components/HomeWidget';
import { useHomeData } from './hooks/useHomeData';
import HomeTimeTableWidget from './widgets/timetable';
import GradesWidget from './widgets/Grades';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/new/Button';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Typography from '@/ui/new/Typography';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = insets.bottom + 16;
  const focused = useIsFocused();

  // Account
  const store = useAccountStore();
  const accounts = useAccountStore((state) => state.accounts);
  const account = accounts.find(a => a.id === store.lastUsedAccount)!;
  const router = useRouter();

  React.useEffect(() => {
    console.log(accounts)
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
    }
    if (accounts.length > 0) {
      checkConsent().then(consent => {
        if (!consent.given) {
          router.push("../consent");
        }
      });
      if (account.transport === undefined) {
        store.initializeTransport(account.schoolName);
      }
    }
  }, [accounts.length]);

  useHomeData();

  const [gradesWidgetHidden, setGradesWidgetHidden] = React.useState(true);

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderGrades = React.useCallback(
    () => <GradesWidget onEmptyStateChange={setGradesWidgetHidden} />,
    []
  );

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
      hidden: gradesWidgetHidden,
      render: renderGrades
    }
  ], [renderTimeTable, renderGrades, gradesWidgetHidden]);

  const alert = useAlert();

  return (
    <>
      <Wallpaper />
      <HomeTopBar />
      {focused && <StatusBar translucent animated barStyle={'light-content'} />}
      <HomeViewContainer>
        <FlatList
          renderItem={({ item }) => <HomeWidget item={item} />}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={<HomeHeader />}
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
