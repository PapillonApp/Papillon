import { useEventsForDay } from "@/database/useEvents";
import { database } from "@/database";
import Event from "@/database/models/Event";
import { Link, useNavigation, useRouter } from "expo-router";
import { CalendarDaysIcon, CalendarIcon, ChevronDown, Hamburger, ListFilter, Plus, Search } from "lucide-react-native";
import React, { Alert, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { useHeaderHeight } from '@react-navigation/elements';

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import Course from "@/ui/components/Course";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import { Animation } from "@/ui/utils/Animation";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";

import { LinearTransition } from "react-native-reanimated";
import { MenuView } from '@react-native-menu/menu';
import { useCallback, useEffect, useState } from "react";
import Calendar from "@/ui/components/Calendar";
import { Dynamic } from "@/ui/components/Dynamic";
import { Q } from '@nozbe/watermelondb';
import { LegendList } from "@legendapp/list";
import { t } from "i18next";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";

export default function TabOneScreen() {
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const { colors } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  // WatermelonDB events for the selected day
  const events = useEventsForDay(date, refresh);

  useEffect(() => {
    setIsRefreshing(false);
  }, [events]);

  // Add demo event
  const addDemoEvent = async () => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const randomTime = new Date(startOfDay.getTime() + Math.random() * (endOfDay.getTime() - startOfDay.getTime()));
      const start = randomTime.getTime();
      const end = start + 60 * 60 * 1000; // 1 hour
      await database.write(async () => {
        await database.get<Event>('events').create(ev => {
          ev.title = 'Demo Event';
          ev.start = start;
          ev.end = end;
          ev.color = '#21A467';
          ev.room = 'Demo Room';
          ev.teacher = 'Demo Teacher';
          ev.status = 'Demo';
          ev.canceled = false;
        });
      });
    } catch (err) {
      // Optionally, handle error
    }
    setRefresh(r => r + 1); // trigger refetch
  };

  const headerHeight = useHeaderHeight();
  const bottomHeight = useBottomTabBarHeight();

  return (
    <>
      <Calendar
        date={date}
        onDateChange={(newDate) => {
          setDate(newDate);
        }}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

      <NativeHeaderSide side="Left">
        <MenuView
          actions={[
            {
              id: 'manage_icals',
              title: t("Tab_Calendar_Icals"),
              subtitle: t("Tab_Calendar_Icals_Description"),
              imageColor: colors.text,
              image: Platform.select({
                ios: 'calendar',
                android: 'ic_menu_add',
              }),
            }
          ]}
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === 'manage_icals') {
              router.push({
                pathname: "./calendar/icals",
                params: {}
              });
            }
          }}
        >
          <NativeHeaderPressable>
            <CalendarDaysIcon color={colors.text} />
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>

      <NativeHeaderTitle
        key={"header-" + date.toISOString()}
      >
        <NativeHeaderTopPressable
          onPress={() => toggleDatePicker()}
          layout={Animation(LinearTransition)}
        >
          <Dynamic
            animated
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            key={"picker-" + date.toISOString()}
          >
            <Typography variant="navigation">
              {date.toLocaleDateString("fr-FR", { weekday: "long" })}
            </Typography>
            <NativeHeaderHighlight color="#D6502B">
              {date.toLocaleDateString("fr-FR", { day: "numeric" })}
            </NativeHeaderHighlight>
            <Typography variant="navigation">
              {date.toLocaleDateString("fr-FR", { month: "long" })}
            </Typography>
          </Dynamic>
          <Dynamic animated>
            <ChevronDown color={colors.text} opacity={0.7} />
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => { addDemoEvent() }}
        >
          <Plus color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <LegendList
        data={events}
        style={styles.container}
        waitForInitialLayout
        contentContainerStyle={{
          paddingTop: headerHeight + 8,
          paddingHorizontal: 12,
          paddingBottom: bottomHeight + 12,
          gap: 4,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setRefresh(r => r + 1);
            }}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.containerContent}>
            <Typography variant="title" color="secondary">
              {t("Tab_Calendar_Empty")}
            </Typography>
            <Typography variant="caption" color="secondary">
              {t("Tab_Calendar_Empty_Description")}
            </Typography>
          </View>
        )}
        renderItem={({ item }) => (
          <Course
            id={item.id}
            name={item.title}
            teacher={item.teacher ? { firstName: item.teacher, lastName: "" } : undefined}
            room={item.room}
            color={item.color || "#21A467"}
            status={{ label: item.status || "", canceled: !!item.canceled }}
            variant="primary"
            start={Math.floor(item.start / 1000)}
            end={Math.floor(item.end / 1000)}
            readonly={!!item.readonly}

            onPress={() => {
              router.push({
                pathname: "./calendar/event/[id]",
                params: { id: item.id, title: item.title }
              });
            }}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  containerContent: {
  }
});
