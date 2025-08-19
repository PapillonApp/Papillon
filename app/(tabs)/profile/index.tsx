import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { AlignCenter, ArrowUpRight, BackpackIcon, BookOpenTextIcon, CreditCardIcon, MessageCircleIcon, SchoolIcon, SettingsIcon, SofaIcon, User2Icon, UserCircle2, UserPenIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Platform, Pressable, View } from "react-native";
import {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Papicons from '@getpapillon/papicons';

import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Item from "@/ui/components/Item";
import List from "@/ui/components/List";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import Stack from "@/ui/components/Stack";
import TabFlatList from "@/ui/components/TabFlatList";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import adjust from "@/utils/adjustColor";
import { getManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Period } from "@/database/models/Grades";
import { Account } from "@/stores/account/types";

function Tabs() {
  const enabledTabs = [
    {
      icon: Papicons.Chair,
      title: t("Profile_Attendance_Title"),
      unread: 1,
      denominator: t("Profile_Attendance_Denominator_Single"),
      denominator_plural: t("Profile_Attendance_Denominator_Plural"),
      color: "#C50066",
    },
    {
      icon: Papicons.TextBubble,
      title: t("Profile_Discussions_Title"),
      unread: 2,
      denominator: t("Profile_Discussions_Denominator_Single"),
      denominator_plural: t("Profile_Discussions_Denominator_Plural"),
      color: "#0094C5",
    }
  ];

  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack direction="horizontal" hAlign="center" vAlign="center" gap={10}>
      {enabledTabs.map((tab, index) => (
        <Pressable style={{ flex: 1 }} key={index}>
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
            <Icon papicon size={24} fill={tab.unread > 0 ? tab.color : colors.text}>
              <tab.icon />
            </Icon>
            <Stack direction="vertical" hAlign="start" gap={2} style={{ marginBottom: -2 }}>
              <Typography inline variant="title" color={tab.unread > 0 ? tab.color : colors.text}>{tab.title}</Typography>
              <Typography inline variant="caption" color={tab.unread > 0 ? tab.color : "secondary"}>{tab.unread > 0 ? `${tab.unread} ${tab.unread > 1 ? tab.denominator_plural : tab.denominator}` : "Ouvrir"}</Typography>
            </Stack>
          </Stack>
        </Pressable>
      ))}
    </Stack >
  );
}

function News() {
  const theme = useTheme();
  const { colors } = theme;

  // Example news item
  const newsItems = [
    {
      title: "Chasse aux œufs dans la cour organisé par la MDL",
      date: "16/01",
      author: "M. SAMSOM",
    },
    {
      title: "Réunion parents-professeurs",
      date: "20/01",
      author: "M. DUPONT",
    }
  ];

  return (
    <>
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
          <Papicons.Newspaper />
        </Icon>
        <Typography
          color={adjust("#7DBB00", theme.dark ? 0.3 : -0.3)}
          style={{ flex: 1 }}
          variant="h5"
        >
          {t("Profile_News_Title")}
        </Typography>
        <Pressable>
          <Stack direction="horizontal" vAlign="center" hAlign="center" card inline padding={[12, 6]} radius={100} height={32}>
            <Typography style={{ marginBottom: -3 }} inline color="secondary">
              {newsItems.length} {newsItems.length > 1 ? t("Profile_News_Denominator_Plural") : t("Profile_News_Denominator_Single")}
            </Typography>
            <Icon papicon opacity={0.5} size={20}>
              <Papicons.ArrowRightUp />
            </Icon>
          </Stack>
        </Pressable>
      </Stack>
      <List marginBottom={0} radius={24}>
        {newsItems.map((item, index) => (
          <Item key={index}>
            <Typography variant="title" color="text">
              {item.title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.date}  ·  {item.author}
            </Typography>
          </Item>
        ))}
      </List>
    </>
  )
}

function Cards() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Pressable>
      <Stack card height={84} direction="horizontal" vAlign="start" hAlign="center" gap={12} padding={18} radius={24} backgroundColor={theme.dark ? "#151515" : "#F0F0F0"}>
        <Icon
          fill={colors.text}
          opacity={0.6}
          size={24}
          papicon
        >
          <Papicons.Card />
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
  );
}

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const manager = getManager();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    function fetchData() {
      if (!manager) {
        return;
      }

      const result = manager.getAccount();
      setAccount(result);
    }
    fetchData();
  }, [manager]);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!account) return [null, null, null, null];

    let firstName = account.firstName;
    let lastName = account.lastName;
    let level;
    let establishment;

    return [firstName, lastName, level, establishment];
  }, [account]);

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
            console.log("Pressed");
          }}
        >
          <Icon>
            <UserPenIcon />
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
          <Icon>
            <SettingsIcon />
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
              <News /> : item === "cards" ?
                <Cards /> : null
        )}
        keyExtractor={(item) => item + "a"}
        header={
          <>
            <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 20, paddingTop: 0 }}>
              <Stack direction={"vertical"} hAlign={"center"} gap={10} style={{ flex: 1 }}>
                <Image
                  source={require('@/assets/images/default_profile.jpg')}
                  style={{ width: 75, height: 75, borderRadius: 500 }}
                />
                <Typography variant={"h3"} color="text">
                  {manager ? `${firstName} ${lastName}` : t("Settings_Account_Title")}
                </Typography>
                <Stack direction={"horizontal"} hAlign={"center"} vAlign={"center"} gap={6}>
                  {level && (
                    <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline padding={[12, 5]} card flat>
                      <Icon papicon opacity={0.5}>
                        <Papicons.Ghost />
                      </Icon>
                      <Typography variant={"body1"} color="secondary">
                        {level}
                      </Typography>
                    </Stack>
                  )}
                  {establishment && (
                    <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline padding={[12, 5]} card flat>
                      <Icon papicon opacity={0.5}>
                        <Papicons.Student />
                      </Icon>
                      <Typography variant={"body1"} color="secondary">
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