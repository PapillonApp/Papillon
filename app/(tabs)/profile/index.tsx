import { Chair, Papicons, TextBubble } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { router, useRouter } from "expo-router";
import { t } from "i18next";
import { SettingsIcon, UserPenIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Platform, Pressable, View } from "react-native";
import {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Attendance } from "@/services/shared/attendance";
import { Chat } from "@/services/shared/chat";
import { Period } from "@/services/shared/grade";
import { News } from "@/services/shared/news";
import { Account } from "@/stores/account/types";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Item, { Leading } from "@/ui/components/Item";
import List from "@/ui/components/List";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import Stack from "@/ui/components/Stack";
import TabFlatList from "@/ui/components/TabFlatList";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { warn } from "@/utils/logger/logger";
import { useAccountStore } from "@/stores/account";
import { Avatar } from "@/app/(features)/(news)/news";
import { Capabilities } from "@/services/shared/types";


function Tabs() {
  const [availableClientsAttendance, setAvailableClientsAttendance] = useState<number>(0);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [discussion, setDiscussion] = useState<Chat[]>([]);
  const [attendancePeriods, setAttendancePeriods] = useState<Period[]>([]);

  const enabledTabs = useMemo(() => [
    {
      icon: Chair,
      title: t("Profile_Attendance_Title"),
      unread: attendances.reduce((count, attendance) => count + attendance.absences.filter(absence => !absence.justified).length, 0),
      denominator: t("Profile_Attendance_Denominator_Single"),
      denominator_plural: t("Profile_Attendance_Denominator_Plural"),
      color: "#C50066",
      disabled: !(availableClientsAttendance),
      onPress: () => {
        if (attendances.length === 0 || attendancePeriods.length === 0) return;
        router.push({
          pathname: "/(features)/attendance",
          params: {
            periods: JSON.stringify(attendancePeriods),
            currentPeriod: JSON.stringify(getCurrentPeriod(attendancePeriods)),
            attendances: JSON.stringify(attendances)
          }
        })
      }
    },
    {
      icon: TextBubble,
      title: t("Profile_Discussions_Title"),
      unread: discussion.length,
      denominator: t("Profile_Discussions_Denominator_Single"),
      denominator_plural: t("Profile_Discussions_Denominator_Plural"),
      color: "#0094C5",
    }
  ], [attendances]);

  const theme = useTheme();
  const { colors } = theme;

  const fetchAttendance = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping attendance fetch');
      return;
    }
    const availableClients = manager.getAvailableClients(Capabilities.ATTENDANCE)
    setAvailableClientsAttendance(availableClients.length)
    const periods = await manager.getAttendancePeriods();
    const currentPeriod = getCurrentPeriod(periods)
    const attendances = await manager.getAttendanceForPeriod(currentPeriod.name);

    setAttendancePeriods(periods)
    setAttendances(attendances);
  }, []);

  const fetchDiscussions = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping discussions fetch');
      return;
    }
    const chats = await manager.getChats();
    setDiscussion(chats);
  }, []);


  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((manager) => {
      fetchAttendance();
      fetchDiscussions();
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack direction="horizontal" hAlign="center" vAlign="center" gap={10}>
      {enabledTabs.map((tab, index) => (
        <AnimatedPressable
          entering={PapillonAppearIn}
          exiting={PapillonAppearOut}
          key={"tab_profile:" + index + ":" + tab.unread}
          style={{ flex: 1 }}
          disabled={tab.disabled}
          onPress={tab.onPress}
        >
          <Stack
            flex
            card
            direction="horizontal"
            hAlign="center"
            gap={14}
            padding={16}
            height={58}
            radius={200}
            backgroundColor={tab.unread > 0 ? adjust(tab.color, theme.dark ? -0.85 : 0.85) : colors.card}
          >
            <Icon papicon fill={tab.unread > 0 ? tab.color : colors.text}>
              <tab.icon />
            </Icon>
            <Stack direction="vertical" hAlign="start" gap={2} style={{ marginBottom: -2 }}>
              <Typography inline variant="title" color={tab.unread > 0 ? tab.color : colors.text}>{tab.title}</Typography>
              <Typography inline variant="caption" color={tab.unread > 0 ? tab.color : "secondary"}>{tab.unread > 0 ? `${tab.unread} ${tab.unread > 1 ? tab.denominator_plural : tab.denominator}` : "Ouvrir"}</Typography>
            </Stack>
          </Stack>
        </AnimatedPressable>
      ))}
    </Stack>
  );
}

function NewsSection() {
  const theme = useTheme();
  const { colors } = theme;

  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(() => {
    try {
      const manager = getManager();
      if (!manager) {
        warn('Manager is null, skipping news fetch');
        return;
      }
      manager.getNews().then((fetchedNews) => {
        setNews(fetchedNews.splice(0, 2));
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((manager) => {
      fetchNews();
    });

    return () => unsubscribe();
  }, []);

  if (news.length === 0 && !loading) {
    return null;
  }

  return (
    <>
      <Reanimated.View
        layout={Animation(LinearTransition, "list")}
        entering={PapillonAppearIn}
        exiting={PapillonAppearOut}
      >
        <Stack
          direction="horizontal"
          gap={12}
          card
          vAlign="start"
          hAlign="center"
          style={{
            paddingHorizontal: 10,
            paddingTop: 8,
            paddingBottom: 8 + 38,
            marginBottom: -38,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
          backgroundColor={adjust("#7DBB00", theme.dark ? -0.85 : 0.85)}
        >
          <Icon
            fill={adjust("#7DBB00", theme.dark ? 0.3 : -0.3)}
            size={24}
            style={{ marginLeft: 8, marginRight: 0 }}
            papicon
          >
            <Papicons name={"Newspaper"} />
          </Icon>
          <Typography
            color={adjust("#7DBB00", theme.dark ? 0.3 : -0.3)}
            style={{ flex: 1 }}
            variant="h5"
          >
            {t("Profile_News_Title")}
          </Typography>
          <Pressable onPress={() => {
            router.push({
              pathname: "/(features)/(news)/news",
              params: {
                news: JSON.stringify(news)
              }
            })
          }}>
            <Stack
              direction="horizontal"
              vAlign="center"
              hAlign="center"
              inline
              padding={[12, 6]}
              radius={100}
              height={32}
              backgroundColor={"#7DBB0040"}
            >
              <Typography style={{ marginBottom: -3 }} inline color={adjust("#7DBB00", -0.3)}>
                {news.filter(news => !news.acknowledged).length > 0 ? news.filter(news => !news.acknowledged).length + news.filter(news => !news.acknowledged).length > 1 ? t("Profile_News_Denominator_Plural") : t("Profile_News_Denominator_Single") : t("Profile_News_Open")}
              </Typography>
              <Icon papicon size={20} fill={adjust("#7DBB00", -0.3)} >
                <Papicons name={"ArrowRightUp"} />
              </Icon>
            </Stack>
          </Pressable>
        </Stack>
        <List marginBottom={0} radius={24}>
          {news.map((item, index) => (
            <Item
              key={index}
              onPress={() => {
                router.push({
                  pathname: "/(features)/(news)/specific",
                  params: {
                    news: JSON.stringify(item)
                  }
                })
              }}
            >
              <Typography variant="title" color="text">
                {item.title}
              </Typography>
              <Typography variant="caption" color="secondary">
                {item.createdAt.getDate()}  ·  {item.author}
              </Typography>
            </Item>
          ))}
          {loading && (
            <Item>
              <Leading>
                <ActivityIndicator />
              </Leading>
              <Typography variant="title" color="text">
                {t("Profile_News_Loading_Title")}
              </Typography>
            </Item>
          )}
        </List>
      </Reanimated.View>
    </>
  )
}

function Cards() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Reanimated.View
      layout={Animation(LinearTransition, "list")}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
    >
      <Pressable onPress={() => {
        router.push("/(features)/(cards)/cards")
      }}>
        <Stack card height={84} direction="horizontal" vAlign="start" hAlign="center" gap={12} padding={18} radius={24}>
          <Icon
            fill={colors.text}
            opacity={0.6}
            size={24}
            papicon
          >
            <Papicons name={"Card"} />
          </Icon>
          <Typography variant="h5" color="text" style={{ opacity: 0.6 }}>
            {t("Profile_Cards_Title")}
          </Typography>

          <View
            style={{
              width: 200,
              height: 84,
              position: "absolute",
              right: 0,
              overflow: "hidden",
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <Image
              source={require('@/assets/images/cartes.png')}
              style={{
                width: 140,
                height: 120,
                position: "absolute",
                right: -32,
                bottom: -32,
              }}
            />
          </View>
        </Stack>
      </Pressable>
    </Reanimated.View>
  );
}

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const manager = getManager();

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!lastUsedAccount) return [null, null, null, null];

    let firstName = account?.firstName;
    let lastName = account?.lastName;
    let level = account?.className;
    let establishment = account?.schoolName;

    return [firstName, lastName, level, establishment];
  }, [lastUsedAccount]);

  const headerHeight = useHeaderHeight();

  const router = useRouter();

  const windowHeight = Dimensions.get('window').height;
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const theme = useTheme();
  const { colors } = useTheme();

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  return (
    <>
      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            router.push("/(tabs)/profile/custom")
          }}
        >
          <Icon size={28}>
            <Papicons name={"PenAlt"} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
      <NativeHeaderTitle ignoreTouch key={`header-title:` + fullyScrolled}>
        <NativeHeaderTopPressable layout={Animation(LinearTransition)}>
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              marginTop: fullyScrolled ? 6 : 0,
              width: 200,
            }}
          >
            {fullyScrolled && (
              <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: 4, width: 200, justifyContent: "center" }}>
                <Dynamic animated>
                  <Typography inline variant="navigation">
                    {(firstName || lastName) ? `${firstName} ${lastName}` : t("Settings_Account_Title")}
                  </Typography>
                </Dynamic>
              </Dynamic>
            )}
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => {
            router.push("/(settings)/settings");
          }}
        >
          <Icon size={28}>
            <Papicons name={"Gears"} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <TabFlatList
        backgroundColor={theme.dark ? "#151515" : "#F0F0F0"}
        height={200}
        onFullyScrolled={handleFullyScrolled}
        data={["tabs", "news", "cards", "apps"]}
        gap={16}
        radius={42}
        renderItem={({ item, index }) => (
          item === "tabs" ?
            <Tabs /> : item === "news" ?
              <NewsSection /> : item === "cards" ?
                <Cards /> : null
        )}
        keyExtractor={(item) => item + "a"}
        header={
          <>
            <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 20, paddingTop: 0 }}>
              <Stack direction={"vertical"} hAlign={"center"} gap={10} style={{ flex: 1 }}>
                {account && account.customisation && account.customisation.profilePicture && !account.customisation.profilePicture.startsWith("PCFET0NUWVBFIGh0bWw+") ? (
                  <Image
                    source={
                      { uri: `data:image/png;base64,${account.customisation.profilePicture}` }
                    }
                    style={{ width: 75, height: 75, borderRadius: 500 }}
                  />
                ) : (
                  <Avatar size={75} variant="h3" author={`${account?.firstName} ${account?.lastName}`} />
                )
                }
                <Typography variant={"h3"} color="text">
                  {firstName} {lastName}
                </Typography>
                <Stack direction={"horizontal"} hAlign={"center"} vAlign={"center"} gap={6}>
                  {level && (
                    <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline padding={[12, 5]} card flat>
                      <Typography variant={"body1"} color="secondary">
                        {level}
                      </Typography>
                    </Stack>
                  )}
                  {establishment && (
                    <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline padding={[12, 5]} card flat>
                      <Typography
                        variant={"body1"}
                        color="secondary"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ maxWidth: 230 }}
                      >
                        {establishment}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </>
        }
      />

      {!runsIOS26() && fullyScrolled && (
        <Reanimated.View
          entering={Animation(FadeInUp, "list")}
          exiting={Animation(FadeOutUp, "default")}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight + 1,
              backgroundColor: colors.card,
              zIndex: 1000000,
            },
            Platform.OS === 'android' && {
              elevation: 4,
            },
            Platform.OS === 'ios' && {
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }
          ]}
        />
      )}
    </>
  );
}