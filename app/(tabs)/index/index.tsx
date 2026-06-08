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
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getManager, initializeAccountManager } from "@/services/shared";
import { CanteenHistoryItem } from "@/services/shared/canteen";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import Stack from "@/ui/components/Stack";
import { getCanteenTransactionsFromCache } from "@/database/useCanteen";
import { HomeCard } from "@/app/(tabs)/index/atoms/HomeCard";
import { getCodeType } from "@/utils/services/helper";

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
      {
        scale:
          scrollOffset.value >= 0
            ? Math.max(1, 1 + scrollOffset.value / 900)
            : Math.max(1, 1 + (scrollOffset.value / 500) * -1),
      },
    ],
    opacity: 1 - scrollOffset.value / 200,
  }));

  const [isRestaurationServices, setIsRestaurationServices] =
    useState<boolean>(false);
  const [canteenHistory, setCanteenHistory] = useState<CanteenHistoryItem[]>(
    []
  );
  const [qrCode, setQrCode] = useState<{ data: string; type: string } | null>(
    null
  );

  React.useEffect(() => {
    if (accounts.length === 0) {
      router.replace("/(onboarding)/welcome");
      return;
    }

    if (account) {
      initializeAccountManager().then(() => {
        if (account.transport === undefined)
          store.initializeTransport(account.schoolName);
        setIsRestaurationServices(
          RestaurationServices.includes(account.services[0].serviceId)
        );
      });
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
    if (account && isRestaurationServices) {
      (async () => {
        setCanteenHistory(
          await getCanteenTransactionsFromCache()
        );
        const manager = getManager();

        setCanteenHistory(await manager.getCanteenTransactionsHistory(account.id));
        const qr = await manager.getCanteenQRCodes(account.id);

        if (qr.data.length > 0)
        setQrCode({
          data: qr.data,
          type: getCodeType(account.services[0].serviceId),
        });
      })();
    }
  }, [account, isRestaurationServices]);

  useHomeData();
  const { courses } = useTimetableWidgetData();
  const timetableTitle = useTimetableWidgetTitle(courses);

  const [gradesWidgetHidden, setGradesWidgetHidden] = React.useState(true);

  const renderTimeTable = React.useCallback(() => <HomeTimeTableWidget />, []);
  const renderGrades = React.useCallback(
    () => <GradesWidget onEmptyStateChange={setGradesWidgetHidden} />,
    []
  );

  function getRelativeDayStatus(date: Date): string {
    const days = differenceInCalendarDays(
      startOfDay(date),
      startOfDay(new Date())
    );

    if (days === 0) {
      return `${t("Today")} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    if (days === -1) {
      return `${t("Yesterday")} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const data: HomeWidgetItem[] = React.useMemo(
    () => [
      {
        icon: <Papicons name={"Calendar"} />,
        title: timetableTitle,
        redirect: "(tabs)/calendar",
        render: renderTimeTable,
        hidden: isRestaurationServices,
      },
      {
        icon: <Papicons name={"Grades"} />,
        title: t("Home_Widget_Grades_Average"),
        redirect: "(tabs)/grades",
        hidden: gradesWidgetHidden,
        render: renderGrades,
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
        {isRestaurationServices ? (
          <List
            ref={flatListRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom:
                100 + (Platform.OS === "android" ? 0 : insets.bottom),
              paddingHorizontal: 16,
              flexGrow: 1,
            }}
            ListHeaderComponent={
              <HomeHeader isRestaurationServices={isRestaurationServices} />
            }
          >
            {canteenHistory.map(item => (
              <List.Item>
                <Typography variant="title" numberOfLines={1}>
                  {item.label}
                </Typography>
                <Typography
                  variant={"body1"}
                  color={"textSecondary"}
                  numberOfLines={1}
                >
                  {getRelativeDayStatus(item.date)}
                </Typography>

                <List.Trailing>
                  <Stack
                    padding={[12, 4]}
                    style={{
                      backgroundColor:
                        item.amount >= 0 ? "#42C50015" : "#C5000015",
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: item.amount >= 0 ? "#42C50017" : "#C5000017",
                    }}
                  >
                    <Typography
                      variant="title"
                      color={item.amount >= 0 ? "#42C500" : "#C50000"}
                      style={{ fontSize: 16, fontWeight: 500 }}
                      numberOfLines={1}
                    >
                      {`${item.amount >= 0 ? "+" : ""}${(item.amount / 100).toFixed(2)}${item.currency}`}
                    </Typography>
                  </Stack>
                </List.Trailing>
              </List.Item>
            ))}
          </List>
        ) : (
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
        )}
      </HomeViewContainer>
      {isRestaurationServices && qrCode && <HomeCard qrcode={qrCode} />}
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
