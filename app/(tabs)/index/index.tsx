import { Papicons } from "@getpapillon/papicons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import React, { useState } from "react";
import { FlatList, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountStore } from "@/stores/account";
import { checkConsent } from "@/utils/logger/consent";

import HomeHeader from "./atoms/HomeHeader";
import HomeTopBar from "./atoms/HomeTopBar";
import Wallpaper from "./atoms/Wallpaper";
import HomeWidget, { HomeWidgetItem } from "./components/HomeWidget";
import { useHomeData } from "./hooks/useHomeData";
import { useTimetableWidgetData } from "./hooks/useTimetableWidgetData";
import { useTimetableWidgetTitle } from "./hooks/useTimetableWidgetTitle";
import HomeTimeTableWidget from "./widgets/timetable";
import GradesWidget from "./widgets/Grades";
import MaskedView from "@react-native-masked-view/masked-view";
import LinearGradient from "react-native-linear-gradient";
import MainTabErrorBoundary from "@/ui/components/MainTabErrorBoundary";
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { RestaurationServices } from "@/stores/account/types";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = insets.bottom + 16;
  const focused = useIsFocused();

  // Account
  const store = useAccountStore();
  const accounts = useAccountStore(state => state.accounts);
  const account = accounts.find(a => a.id === store.lastUsedAccount);
  const router = useRouter();

  // Ref
  const flatListRef = useAnimatedRef<FlatList>();
  const scrollOffset = useScrollOffset(flatListRef);

  const scrollableItem = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.max(0, scrollOffset.value) * -1 },
      { scale: Math.max(1, 1 + scrollOffset.value / 900) },
    ],
    opacity: 1 - scrollOffset.value / 200,
  }));

  const [isRestaurationServices, setIsRestaurationServices] =
    useState<boolean>(false);

  React.useEffect(() => {
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
      return;
    }

    checkConsent().then(consent => {
      if (!consent.given) {
        router.push("../consent");
      }
    });

    if (account) {
      if (account.transport === undefined)
        store.initializeTransport(account.schoolName);
      setIsRestaurationServices(
        RestaurationServices.includes(account.services[0].serviceId)
      );
    }
  }, [account, accounts.length, router, store]);

  useHomeData();
  const { courses } = useTimetableWidgetData();
  const timetableTitle = useTimetableWidgetTitle(courses);

  const [gradesWidgetHidden, setGradesWidgetHidden] = React.useState(true);

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderGrades = React.useCallback(
    () => <GradesWidget onEmptyStateChange={setGradesWidgetHidden} />,
    []
  );

  const data: HomeWidgetItem[] = React.useMemo(
    () => [
      {
        icon: <Papicons name={"Calendar"} />,
        title: timetableTitle,
        redirect: "(tabs)/calendar",
        render: renderTimeTable,
      },
      {
        icon: <Papicons name={"Grades"} />,
        title: t("Home_Widget_Grades_Average"),
        redirect: "(tabs)/grades",
        hidden: gradesWidgetHidden,
        render: renderGrades,
      },
      {
        icon: <Papicons name={"Grades"} />,
        title: t("Home_Widget_Grades_Average"),
        redirect: "(tabs)/grades",
        hidden: false,
        render: () => (<View style={{height: 200000}}/>),
      },
    ],
    [renderTimeTable, renderGrades, gradesWidgetHidden, timetableTitle]
  );

  return (
    <>
      <Animated.View style={scrollableItem}>
        <Wallpaper blur={isRestaurationServices} />
      </Animated.View>
      <HomeTopBar scroll={scrollOffset} />
      {focused && <StatusBar translucent animated barStyle={"light-content"} />}
      <HomeViewContainer>
        <Animated.FlatList
          ref={flatListRef}
          renderItem={({ item }) => <HomeWidget item={item} />}
          keyExtractor={item => item.title}
          ListHeaderComponent={
            <HomeHeader isRestaurationServices={isRestaurationServices} />
          }
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "ios" ? bottomTabBarHeight : 16,
            paddingHorizontal: 16,
            flexGrow: 1,
            gap: 12,
            marginTop: 6,
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
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <LinearGradient
            colors={["#ff000022", "white"]}
            locations={[0.5, 1]}
            style={{ height: insets.top + 68 }}
          />
          <View style={{ flex: 1, backgroundColor: "white" }} />
        </View>
      }
      style={{ flex: 1 }}
    >
      {children}
    </MaskedView>
  );
};

const HomeScreenWithBoundary = () => (
  <MainTabErrorBoundary>
    <HomeScreen />
  </MainTabErrorBoundary>
);

export default HomeScreenWithBoundary;
