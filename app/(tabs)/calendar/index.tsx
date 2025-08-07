import { LegendList } from "@legendapp/list";
import { MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { CalendarDaysIcon, ChevronDown, Plus } from "lucide-react-native";
import React, { useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import { Dimensions,FlatList, Platform, RefreshControl, StyleSheet, View } from "react-native";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";
import { LinearTransition } from "react-native-reanimated";

import Event from "@/database/models/Event";
import { useEventsForDay } from "@/database/useEvents";
import Calendar from "@/ui/components/Calendar";
import Course from "@/ui/components/Course";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

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

  let events: Event[] = [];

  // WatermelonDB events for the selected day
  try {
    events = useEventsForDay(date, refresh);
  } catch (err) {
    console.error("Error fetching events:", err);
  }

  useEffect(() => {
    setIsRefreshing(false);
    console.log(events);
  }, [events]);

  // Add demo event
  const addDemoEvent = useCallback(async () => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const randomTime = new Date(startOfDay.getTime() + Math.random() * (endOfDay.getTime() - startOfDay.getTime()));
      const start = randomTime.getTime();
      const end = start + 60 * 60 * 1000; // 1 hour
      await createEventWithSubject({
        title: 'Demo Event',
        start,
        end,
        color: '#21A467',
        room: 'Demo Room',
        teacher: 'Demo Teacher',
        status: 'Demo',
        canceled: false,
        subject: {
          name: 'Demo Subject',
          code: 'DEMO',
          color: '#21A467',
        },
      });
      setRefresh(r => r + 1); // trigger refetch after adding event
    } catch (err) {
      // Optionally, handle error
    }
  }, [date]);

  const headerHeight = useHeaderHeight();
  const bottomHeight = useBottomTabBarHeight();
  const globalPaddingTop = runsIOS26() ? headerHeight + 8 : 12;
  const windowWidth = Dimensions.get("window").width;
  const INITIAL_INDEX = 10000;
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  // Store the reference date for index 10000
  const referenceDate = useRef(new Date());
  useEffect(() => {
    referenceDate.current.setHours(0, 0, 0, 0);
  }, []);

  // Helper to get date from index
  const getDateFromIndex = useCallback((index: number) => {
    const d = new Date(referenceDate.current);
    d.setDate(referenceDate.current.getDate() + (index - INITIAL_INDEX));
    return d;
  }, [INITIAL_INDEX]);

  // Helper to get index from date
  const getIndexFromDate = useCallback((d: Date) => {
    const base = new Date(referenceDate.current);
    base.setHours(0, 0, 0, 0);
    const diff = Math.floor((d.setHours(0, 0, 0, 0) - base.getTime()) / (1000 * 60 * 60 * 24));
    return INITIAL_INDEX + diff;
  }, [INITIAL_INDEX]);

  // FlatList ref for programmatic scroll
  const flatListRef = useRef<FlatList<any>>(null);

  // When date changes manually, update currentIndex and scroll FlatList to correct index
  useEffect(() => {
    const newIndex = getIndexFromDate(date);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({
            index: newIndex,
            animated: false, // Teleport instantly to the date
          });
        } catch (e) {
          // If out of range, ignore
        }
      }
    }
  }, [date, getIndexFromDate, currentIndex]);

  // Handle swipe (momentum end) to update date
  const onMomentumScrollEnd = useCallback((e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const newDate = getDateFromIndex(newIndex);
      setDate((prev) => prev.getTime() !== newDate.getTime() ? newDate : prev);
    }
  }, [windowWidth, currentIndex, getDateFromIndex]);

  // Track last emitted index to avoid unnecessary updates
  const lastEmittedIndex = useRef(currentIndex);

  // Update date as soon as the user swipes past the midpoint of a day
  const onScroll = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / windowWidth);
    if (newIndex !== lastEmittedIndex.current) {
      lastEmittedIndex.current = newIndex;
      setCurrentIndex(newIndex);
      const newDate = getDateFromIndex(newIndex);
      setDate((prev) => prev.getTime() !== newDate.getTime() ? newDate : prev);
    }
  }, [windowWidth, getDateFromIndex]);

  const DayEventsPage = React.memo(function DayEventsPage({ dayDate, headerHeight, bottomHeight, isRefreshing, setRefresh, colors, router, t }: any) {
    const rawDayEvents = useEventsForDay(dayDate, refresh);

    // Cache to preserve event object identity by id
    const eventCache = React.useRef<{ [id: string]: any }>({});

    // Shallow compare function
    function shallowEqual(objA: any, objB: any) {
      if (objA === objB) { return true; }
      if (!objA || !objB) { return false; }
      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);
      if (keysA.length !== keysB.length) { return false; }
      for (const key of keysA) {
        if (objA[key] !== objB[key]) { return false; }
      }
      return true;
    }

    const dayEvents = React.useMemo(() => {
      const cache = eventCache.current;
      const next: { [id: string]: any } = {};
      const result = rawDayEvents.map(ev => {
        if (cache[ev.id] && shallowEqual(ev, cache[ev.id])) {
          next[ev.id] = cache[ev.id];
          return cache[ev.id];
        }
        next[ev.id] = ev;
        return ev;

      });
      eventCache.current = next;
      return result;
    }, [rawDayEvents]);

    return (
      <View style={{ width: Dimensions.get("window").width, flex: 1 }}>
        <LegendList
          data={dayEvents}
          style={styles.container}
          waitForInitialLayout
          contentContainerStyle={[
            {
              paddingTop: globalPaddingTop,
              paddingHorizontal: 12,
              paddingBottom: bottomHeight + 12,
              gap: 4,
            }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setRefresh((r: number) => r + 1);
              }}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          }
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.containerContent}>
              <Typography variant="title" color="secondary" align="center">
                {t("Tab_Calendar_Empty")}
              </Typography>
              <Typography variant="caption" color="secondary" align="center">
                {t("Tab_Calendar_Empty_Description")}
              </Typography>
            </View>
          )}
          renderItem={({ item }) => (
            <Course
              id={item.id}
              name={item.subject ? item.subject.name : item.title}
              teacher={item.teacher}
              room={item.room}
              color={(item.subject ? item.subject.color : item.color) || "#888888"}
              status={{ label: item.status || "", canceled: !!item.canceled }}
              variant="primary"
              start={Math.floor(item.start / 1000)}
              end={Math.floor(item.end / 1000)}
              readonly={!!item.readonly}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/calendar/event/[id]",
                  params: { id: item.id, title: item.title || item.subject.name || item.subject.code || "Event" }
                });
              }}
            />
          )}
        />
      </View>
    );
  }, (prevProps, nextProps) => {
    // Only rerender if dayDate or isRefreshing changes
    return (
      prevProps.dayDate.getTime() === nextProps.dayDate.getTime() &&
      prevProps.isRefreshing === nextProps.isRefreshing
    );
  });

  // Stable renderItem function
  const renderDay = useCallback(({ index }: { index: number }) => {
    const dayDate = getDateFromIndex(index);
    return (
      <DayEventsPage
        dayDate={dayDate}
        headerHeight={headerHeight}
        bottomHeight={bottomHeight}
        isRefreshing={isRefreshing}
        setRefresh={setRefresh}
        colors={colors}
        router={router}
        t={t}
      />
    );
  }, [headerHeight, bottomHeight, isRefreshing, setRefresh, colors, router, t, getDateFromIndex]);

  return (
    <>
      <Calendar
        key={"calendar-" + date.toISOString()}
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

      <NativeHeaderTitle key={"header-" + date.toISOString()}>
        <NativeHeaderTopPressable
          onPress={toggleDatePicker}
          layout={Animation(LinearTransition)}
        >
          <Dynamic
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Dynamic animated key={date.toLocaleDateString("fr-FR", { weekday: "long" })}>
              <Typography variant="navigation">
                {date.toLocaleDateString("fr-FR", { weekday: "long" })}
              </Typography>
            </Dynamic>
            <Dynamic animated key={date.toLocaleDateString("fr-FR", { day: "numeric" })}>
              <NativeHeaderHighlight color="#D6502B" style={{ marginBottom: 0 }}>
                {date.toLocaleDateString("fr-FR", { day: "numeric" })}
              </NativeHeaderHighlight>
            </Dynamic>
            <Dynamic animated key={date.toLocaleDateString("fr-FR", { month: "long" })}>
              <Typography variant="navigation">
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
        <NativeHeaderPressable
          onPress={() => {
            router.push({
              pathname: "/(new)/event",
              params: { date: date.toISOString() }
            });
          }}
        >
          <Plus color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      {/* Optimized FlatList for horizontal day swiping */}
      <FlatList
        ref={flatListRef as any}
        data={Array.from({ length: 20001 })} // Large number for virtualized days
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={INITIAL_INDEX}
        getItemLayout={(_, index) => ({ length: windowWidth, offset: windowWidth * index, index })}
        renderItem={renderDay}
        keyExtractor={(_, index) => String(index)}
        onScroll={onScroll}
        decelerationRate={0.9}
        disableIntervalMomentum={true}
        snapToAlignment="center"
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        snapToInterval={windowWidth}
        bounces={false}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
        extraData={{ refresh, headerHeight, bottomHeight, isRefreshing, colors, date }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  }
});
