import { Redirect, useRouter } from "expo-router";
import * as pronote from "pawnote";
import { useCallback, useEffect, useMemo, useState } from "react";
import React, { Alert, Dimensions, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { getManager, initializeAccountManager } from "@/services/shared";
import { ARD } from "@/services/ard";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Typography from "@/ui/components/Typography";
import { Colors } from "@/app/(onboarding)/end/color";
import TabFlatList from "@/ui/components/TabFlatList";
import LinearGradient from "react-native-linear-gradient";

import * as Papicons from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Course from "@/ui/components/Course";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import { BellDotIcon, ChevronDown, Filter, ListFilter } from "lucide-react-native";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import { Dynamic } from "@/ui/components/Dynamic";
import { useTheme } from "@react-navigation/native";
import adjust from "@/utils/adjustColor";

import Reanimated from "react-native-reanimated";
import { CompactGrade } from "@/ui/components/CompactGrade";
import { center } from "@shopify/react-native-skia";
import { log } from "@/utils/logger/logger";

import { CourseStatus, Course as SharedCourse } from "@/services/shared/timetable";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectName } from "@/utils/subjects/name";
import { getStatusText } from "../calendar";

export default function TabOneScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [courses, setCourses] = useState<SharedCourse[]>([])
  const router = useRouter();

  const Initialize = async () => {
    await initializeAccountManager()
    log("Refreshed Manager received")
  };

  useMemo(() => {
    Initialize();
  }, []);

  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    const currentWeekNumber = getWeekNumberFromDate(date)
    const weeklyTimetable = await manager.getWeeklyTimetable(currentWeekNumber)
    return setCourses(weeklyTimetable.find(day => day.date === date)?.courses ?? [])
  }, []);

  useEffect(() => {
    fetchEDT();
  }, [fetchEDT]);
  const accounts = useAccountStore.getState().accounts;

  if (accounts.length === 0) {
    router.replace("/(onboarding)/welcome");
    return null;
  }
  const theme = useTheme();
  const { colors } = theme;

  const grades = Array.from({ length: 10 }, (_, i) => ({
    title: `Subject ${i + 1}`,
    value: Math.random() * 20,
    date: new Date()
  }));

  const date = useMemo(() => new Date(), []);
  const accent = "#009EC5";
  const foreground = adjust(accent, theme.dark ? 0.4 : -0.4);
  const foregroundSecondary = adjust(accent, theme.dark ? 0.6 : -0.7) + "88";

  const headerItems = [
    (
      <Stack
        direction="vertical"
        hAlign="center"
        vAlign="center"
        gap={2}
        padding={20}
      >
        <Typography variant="h1" style={{ marginBottom: 2, fontSize: 44, lineHeight: 56 }}>
          👋
        </Typography>
        <Typography variant="h3" color={foreground}>
          Bonjour, Lucas !
        </Typography>
        <Typography variant="body1" color={foregroundSecondary}>
          Tu n'as aucun cours de prévu aujourd'hui
        </Typography>
      </Stack>
    ),
  ];

  return (
    <>
      <LinearGradient
        colors={[accent + "77", accent + "00"]}
        locations={[0, 0.5]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%" }}
      />

      <TabFlatList
        translucent
        backgroundColor="transparent"
        height={160}
        header={
          <>
            <FlatList
              style={{
                backgroundColor: "transparent",
                borderRadius: 26,
                borderCurve: "continuous",
              }}
              horizontal
              data={headerItems}
              snapToInterval={Dimensions.get("window").width}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={e => {
                const page = Math.round(
                  e.nativeEvent.contentOffset.x / Dimensions.get("window").width
                );
                setCurrentPage(page);
              }}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: Dimensions.get("window").width,
                    flex: 1,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {item}
                </View>
              )}
            />

            {/* Pagination */}
            {headerItems.length > 1 &&
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 0,
                  gap: 6,
                }}
              >
                {headerItems.map((item, i) => (
                  <Reanimated.View
                    layout={Animation(LinearTransition)}
                    style={{
                      width: currentPage === i ? 16 : 6,
                      height: currentPage === i ? 8 : 6,
                      backgroundColor: colors.text,
                      borderRadius: 200,
                      opacity: currentPage === i ? 0.5 : 0.25
                    }}
                  />
                ))}
              </View>
            }
          </>
        }
        gap={12}
        data={[
          {
            icon: <Papicons.Calendar />,
            title: "Prochains cours",
            redirect: "(tabs)/calendar",
            render: () => (
              <Stack padding={12} gap={4} style={{ paddingBottom: 6 }}>
                {courses.map(item => (
                  <Course
                    id={item.id}
                    name={item.subject}
                    teacher={item.teacher}
                    room={item.room}
                    color={getSubjectColor(item.subject)}
                    status={{ label: item.customStatus ? item.customStatus : getStatusText(item.status), canceled: (item.status === CourseStatus.CANCELED) }}
                    variant="primary"
                    start={Math.floor(item.from.getTime() / 1000)}
                    end={Math.floor(item.to.getTime() / 1000)}
                    readonly={!!item.createdByAccount}
                    onPress={() => {
                    }}
                  />
                ))}
              </Stack>
            )
          },
          {
            icon: <Papicons.Grades />,
            title: "Nouvelles notes",
            redirect: "(tabs)/grades",
            render: () => (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  borderBottomLeftRadius: 26,
                  borderBottomRightRadius: 26,
                  overflow: "hidden",
                  width: "100%"
                }}
                contentContainerStyle={{
                  paddingTop: 8,
                  paddingBottom: 14,
                  paddingHorizontal: 14,
                  gap: 12
                }}
                data={grades}
                renderItem={({ item }) => (
                  <CompactGrade
                    title={item.title}
                    score={item.value}
                    description="test"
                    outOf={20}
                    emoji="💥"
                    disabled={false}
                    color="#29947A"
                    date={item.date}
                  />
                )}
              />
            )
          },
          {
            icon: <Papicons.Butterfly />,
            title: "Onboarding",
            redirect: "/(onboarding)/welcome",
            buttonLabel: "Aller",
            dev: false
          },
          {
            icon: <Papicons.Butterfly />,
            title: "Devmode",
            redirect: "/devmode",
            buttonLabel: "Aller",
            dev: false
          },
          {
            icon: <Papicons.Butterfly />,
            title: "Demo components",
            redirect: "/demo",
            buttonLabel: "Aller",
            dev: false
          },
        ]}
        renderItem={({ item }) => {
          if (item.dev && !__DEV__) {
            return null;
          }

          return (
            <Stack card radius={26}>
              <Stack direction="horizontal" hAlign="center" padding={12} gap={10} style={{ paddingBottom: item.render ? 0 : undefined, marginTop: -1, height: item.render ? 44 : 56 }}>
                <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
                  {item.icon}
                </Icon>
                <Typography numberOfLines={1} style={{ flex: 1, opacity: 0.6 }} variant="title" color="text">
                  {item.title}
                </Typography>
                {(item.redirect || item.onPress) && (
                  <AnimatedPressable
                    onPress={() => item.onPress ? item.onPress() : router.navigate(item.redirect)}
                  >
                    <Stack card direction="horizontal" hAlign="center" padding={[12, 6]} gap={6}>
                      <Typography variant="body2" color="secondary" inline style={{ marginTop: 2 }}>
                        {item.buttonLabel ?? "Afficher plus"}
                      </Typography>
                      <Icon size={20} papicon opacity={0.5}>
                        <Papicons.ArrowRightUp />
                      </Icon>
                    </Stack>
                  </AnimatedPressable>
                )}
              </Stack>
              {item.render && (
                <item.render />
              )}
            </Stack>
          )
        }}
      />

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable>
          <Icon>
            <ListFilter />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle>
        <NativeHeaderTopPressable
          layout={Animation(LinearTransition)}
        >
          <Dynamic
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Dynamic animated>
              <Typography variant="navigation" color={foreground}>
                {date.toLocaleDateString("fr-FR", { weekday: "long" })}
              </Typography>
            </Dynamic>
            <Dynamic animated>
              <NativeHeaderHighlight color={foreground} style={{ marginBottom: 0 }}>
                {date.toLocaleDateString("fr-FR", { day: "numeric" })}
              </NativeHeaderHighlight>
            </Dynamic>
            <Dynamic animated>
              <Typography variant="navigation" color={foreground}>
                {date.toLocaleDateString("fr-FR", { month: "long" })}
              </Typography>
            </Dynamic>
          </Dynamic>
          <Dynamic animated>
            <ChevronDown color={colors.text} opacity={0.7} />
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable>
          <Icon>
            <BellDotIcon />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});
