import { MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from "@react-navigation/native";
import { Router, useNavigation, useRouter } from "expo-router";
import { t } from "i18next";
import { ChevronDown } from "lucide-react-native";
import React, { memo, useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Dimensions, FlatList, Platform, RefreshControl, StyleSheet, View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import Calendar from "@/ui/components/Calendar";
import Course from "@/ui/components/Course";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";

import { Papicons } from '@getpapillon/papicons';
import Stack from "@/ui/components/Stack";
import Icon from "@/ui/components/Icon";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Course as SharedCourse, CourseDay, CourseStatus } from "@/services/shared/timetable";
import { Colors, getSubjectColor } from "@/utils/subjects/colors";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { log, warn } from "@/utils/logger/logger";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { useTimetable } from '@/database/useTimetable';
import { getSubjectName } from '@/utils/subjects/name';
import { useAccountStore } from '@/stores/account';

const EmptyListComponent = memo(() => (
  <Dynamic key={'empty-list:warn'}>
    <Stack
      hAlign="center"
      vAlign="center"
      margin={16}
    >
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={"Calendar"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {t('Tab_Calendar_Empty')}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {t('Tab_Calendar_Empty_Description')}
      </Typography>
    </Stack>
  </Dynamic>
));

export default function TabOneScreen() {
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const { colors } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false); // controls spinner for manual refresh
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const navigation = useNavigation();

  const [fetchedWeeks, setFetchedWeeks] = useState<number[]>([])
  const [weekNumber, setWeekNumber] = useState(getWeekNumberFromDate(date));
  const manager = getManager();

  const store = useAccountStore.getState()
  const account = store.accounts.find(account => store.lastUsedAccount);
  const services: string[] = account?.services?.map((service: { id: string }) => service.id) ?? [];
  const timetable = useTimetable(refresh, weekNumber).map(day => ({
    ...day,
    courses: day.courses.filter(course => services.includes(course.createdByAccount))
  })).filter(day => day.courses.length > 0);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWeeklyTimetable = useCallback(async (targetWeekNumber: number, forceRefresh = false) => {
    // Clear any pending fetch requests
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    // Debounce the fetch to prevent multiple rapid calls
    fetchTimeoutRef.current = setTimeout(async () => {
      if (forceRefresh) {
        setManualRefreshing(true);
      }
      try {
        if (!manager) {
          warn('Manager is null, skipping timetable fetch');
          return;
        }

        const weeksToFetch = [targetWeekNumber - 1, targetWeekNumber, targetWeekNumber + 1].filter(
          (week) => !fetchedWeeks.includes(week)
        );

        if (weeksToFetch.length > 0) {
          const _ = await Promise.all(
            weeksToFetch.map((week) => manager.getWeeklyTimetable(week))
          );

          setRefresh(prev => prev + 1);
          setFetchedWeeks((prevFetchedWeeks) => [
            ...prevFetchedWeeks,
            ...weeksToFetch,
          ]);
        }
      } catch (error) {
        log('Error fetching weekly timetable: ' + error);
      } finally {
        setManualRefreshing(false);
        fetchTimeoutRef.current = null;
      }
    }, 100); // 100ms debounce
  }, [fetchedWeeks, manager]);

  useEffect(() => {
    fetchWeeklyTimetable(weekNumber);
  }, [weekNumber]);

  // Subscribe to manager updates
  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      if (updatedManager) {
        fetchWeeklyTimetable(weekNumber);
      }
    });

    return () => unsubscribe();
  }, [weekNumber]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefresh(prev => prev + 1);
    fetchWeeklyTimetable(weekNumber, true);
  }, [weekNumber]);

  const headerHeight = useHeaderHeight()
  const bottomHeight = 80;
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
    let newWeekNumber = getWeekNumberFromDate(date);

    if (date.getDay() === 0) {
      newWeekNumber += 1;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({
            index: newIndex,
            animated: false, // Teleport instantly to the date
          });
        } catch (e) {
          warn(String(e))
        }
      }
    }

    if (newWeekNumber !== weekNumber) {
      setWeekNumber(newWeekNumber);
      // Don't call fetchWeeklyTimetable here - let the weekNumber useEffect handle it
    }
  }, [date, getIndexFromDate, currentIndex, weekNumber]);

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
      const newWeekNumber = getWeekNumberFromDate(newDate);
      if (newWeekNumber !== weekNumber) {
        setWeekNumber(newWeekNumber);
        // Don't call fetchWeeklyTimetable here - let the weekNumber useEffect handle it
      }
    }
  }, [windowWidth, getDateFromIndex, weekNumber]);

  const DayEventsPage = React.memo(function DayEventsPage({ dayDate, isRefreshing, onRefresh, colors }: { dayDate: Date, isRefreshing: boolean, onRefresh: () => void, colors: { primary: string, background: string }, router: Router, t: any }) {
    const normalizedDayDate = new Date(dayDate);
    normalizedDayDate.setHours(0, 0, 0, 0);

    const rawDayEvents: SharedCourse[] = timetable.find(w => {
      const weekDate = new Date(w.date);
      weekDate.setHours(0, 0, 0, 0);
      return weekDate.getTime() === normalizedDayDate.getTime();
    })?.courses ?? []

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

    const dayEvents = useMemo(() => {
      const cache = eventCache.current;
      const next: { [id: string]: any } = {};
      const result = (rawDayEvents ?? []).map(ev => {
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

    const threshold = 30;

    for (const day of timetable) {
      for (const course of day.courses) {
        getSubjectColor(course.subject)
        getSubjectEmoji(course.subject)
        getSubjectName(course.subject)
      }
    }

    const separatedDayEvents = useMemo(() => {
      if (!dayEvents || dayEvents.length === 0) return dayEvents;
      const separated: any[] = [];
      for (let i = 0; i < dayEvents.length; i++) {
        separated.push(dayEvents[i]);
        if (i < dayEvents.length - 1) {
          const current = dayEvents[i];
          const next = dayEvents[i + 1];
          if (current.to && next.from) {
            const diffMinutes = (next.from.getTime() - current.to.getTime()) / (1000 * 60);
            if (diffMinutes > threshold) {
              separated.push({
                id: `separator-${current.id}-${next.id}`,
                type: "separator" as any,
                from: new Date(current.to),
                to: new Date(next.from),
              });
            }
          }
        }
      }
      return separated;
    }, [dayEvents]);

    return (
      <View style={{ width: Dimensions.get("window").width, flex: 1 }} key={"day-events-" + dayDate.toISOString()}>
        <FlatList
          data={separatedDayEvents}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={"always"}
          contentContainerStyle={
            {
              paddingHorizontal: 12,
              paddingVertical: 12,
              gap: 4,
            }
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          }
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyListComponent />}
          renderItem={({ item }: { item: SharedCourse }) => {
            if ((item as any).type === 'separator') {
              return (
                <Course
                  id={item.id}
                  name="Pause"
                  variant="separator"
                  start={Math.floor(item.from.getTime() / 1000)}
                  end={Math.floor(item.to.getTime() / 1000)}
                  showTimes={false}
                  onPress={() => {
                    navigation.navigate('(modals)/course', {
                      course: item,
                      subjectInfo: {
                        id: item.subjectId,
                        name: getSubjectName(item.subject),
                        color: getSubjectColor(item.subject) || Colors[0],
                        emoji: getSubjectEmoji(item.subject),
                      }
                    });
                  }}
                />
              );
            }

            return (
              <Course
                id={item.id}
                name={getSubjectName(item.subject)}
                teacher={item.teacher}
                room={item.room}
                color={getSubjectColor(item.subject) || Colors[0]}
                status={{ label: item.customStatus ? item.customStatus : getStatusText(item.status), canceled: (item.status === CourseStatus.CANCELED) }}
                variant="primary"
                start={Math.floor(item.from.getTime() / 1000)}
                end={Math.floor(item.to.getTime() / 1000)}
                readonly={!!item.createdByAccount}
                onPress={() => {
                  navigation.navigate('(modals)/course', {
                    course: item,
                    subjectInfo: {
                      id: item.subjectId,
                      name: getSubjectName(item.subject),
                      color: getSubjectColor(item.subject) || Colors[0],
                      emoji: getSubjectEmoji(item.subject),
                    }
                  });
                }}
              />
            )
          }
          }
        />
      </View>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.dayDate.getTime() === nextProps.dayDate.getTime() &&
      prevProps.isRefreshing === nextProps.isRefreshing &&
      prevProps.onRefresh === nextProps.onRefresh
    );
  });

  // Stable renderItem function
  const renderDay = useCallback(({ index }: { index: number }) => {
    const dayDate = getDateFromIndex(index);
    return (
      <DayEventsPage
        dayDate={dayDate}
        isRefreshing={manualRefreshing}
        onRefresh={handleRefresh}
        colors={colors}
        router={router}
        t={t}
      />
    );
  }, [headerHeight, bottomHeight, manualRefreshing, handleRefresh, colors, router, t, getDateFromIndex, timetable]);

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate);
    const newWeekNumber = getWeekNumberFromDate(newDate);
    if (newWeekNumber !== weekNumber) {
      setWeekNumber(newWeekNumber);
      // Don't call fetchWeeklyTimetable here - let the weekNumber useEffect handle it
    }
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  }, [fetchedWeeks, fetchWeeklyTimetable]);

  return (
    <>
      <Calendar
        key={"calendar-" + date.toISOString()}
        date={date}
        onDateChange={handleDateChange}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

      {/*
      <NativeHeaderSide side="Right">
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
            <Papicons name={"Calendar"} color={"#D6502B"} size={28} />
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>
      */}

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
            <Dynamic animated>
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

      {/*
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
      */}

      {/* Optimized FlatList for horizontal day swiping */}
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
        }}
      >
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
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          snapToInterval={windowWidth}
          bounces={false}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          extraData={{ refresh, headerHeight, bottomHeight, manualRefreshing, colors, date, weekNumber, timetable, handleRefresh }}
        />
      </View>
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

export function getStatusText(status?: CourseStatus): string {
  switch (status) {
    case CourseStatus.ONLINE:
      return t("Online_Course")
    case CourseStatus.EDITED:
      return t("Edited_Course")
    case CourseStatus.CANCELED:
      return t("Canceled_Course")
    case CourseStatus.EVALUATED:
      return t("Evaluated_Course")
    default:
      return ""
  }
}