import { Stack, useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";
import Calendar, { CalendarRef } from "@/ui/components/Calendar";
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import Typography from '@/ui/new/Typography';
import i18n from "@/utils/i18n";

import Reanimated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";

import { CalendarDay } from "./components/CalendarDay";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";

const TITLE_SLIDE_RATIO = 0.4; // Slide this share of the screen width when changing titles

interface DayLabels {
  main: string;
  relative?: string;
}

function getDayLabels(day: Date): DayLabels {
  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const relative = isSameDay(day, today)
    ? t("Today")
    : isSameDay(day, yesterday)
      ? t("Yesterday")
      : isSameDay(day, tomorrow)
        ? t("Tomorrow")
        : undefined;

  return {
    main: day.toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" }),
    relative,
  };
}

// One title per day around the settled one. Keyed by absolute day index, so a
// layer is never remounted while it is on screen.
const TITLE_LAYER_OFFSETS = [-2, -1, 0, 1, 2];

// `pageIndex` is the day this layer renders, as an index into the pager.
// `page` is the pager's live scroll position in the same unit, so the layer is
// centered when they match and slides/fades away as the two drift apart.
function TitleLayer({ page, pageIndex, labels, slideDistance }: {
  page: SharedValue<number>;
  pageIndex: number;
  labels: DayLabels;
  slideDistance: number;
}) {
  const style = useAnimatedStyle(() => {
    const distance = pageIndex - page.value;
    return {
      opacity: Math.max(0, 1 - Math.abs(distance)),
      transform: [{ translateX: distance * slideDistance }],
    };
  });

  return (
    <Reanimated.View pointerEvents="none" style={[styles.titleLayer, style]}>
      <Typography variant="header" weight="semibold" numberOfLines={1}>
        {labels.main}
      </Typography>
      {labels.relative && (
        <Typography variant="body2" color="textSecondary" weight="semibold" numberOfLines={1} style={styles.titleSubtitle}>
          {labels.relative}
        </Typography>
      )}
    </Reanimated.View>
  );
}

function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const calendarRef = useRef<CalendarRef>(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;
  const { width: screenWidth } = useWindowDimensions();

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount)!;

  const {
    date,
    weekNumber,
    currentIndex,
    flatListRef,
    getDateFromIndex,
    getIndexFromDate,
    handleDateChange,
    onMomentumScrollEnd,
    onScroll,
    isResizingRef,
    INITIAL_INDEX,
    windowWidth
  } = useCalendarState();

  const {
    timetable,
    manualRefreshing,
    handleRefresh,
  } = useTimetableData(weekNumber, date);

  // The header is rebuilt natively whenever its options change, so the title and
  // the toolbar label are anchored to the last *settled* day instead of the live
  // one: nothing in the header changes while a swipe is in flight.
  const [settledIndex, setSettledIndex] = useState(INITIAL_INDEX);
  const settledLabels = getDayLabels(getDateFromIndex(settledIndex));
  const dayLabel = settledLabels.relative ?? settledLabels.main;

  // The pager's live scroll position, in pages. Each title layer is anchored to
  // the absolute index of the day it renders, so a day keeps the same position
  // and opacity across a relabel.
  const scrollPage = useSharedValue(INITIAL_INDEX);
  const lastEmittedPage = useSharedValue(INITIAL_INDEX);

  // A window resize changes the page width under the pager: the scroll offset
  // still points at the old geometry, which would otherwise be read back as a
  // completely different day. Pin the pager back onto the settled day at the new
  // width, and ignore every offset until it lands.
  const previousWidth = useRef(windowWidth);
  useLayoutEffect(() => {
    if (previousWidth.current === windowWidth) {
      return;
    }
    previousWidth.current = windowWidth;

    const offset = settledIndex * windowWidth;
    isResizingRef.current = true;
    scrollPage.value = settledIndex;
    lastEmittedPage.value = settledIndex;
    flatListRef.current?.scrollToOffset({ offset, animated: false });

    // The list re-lays out its items a frame later, so the offset has to be
    // reasserted once the new widths are in place.
    const frame = requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset, animated: false });
      isResizingRef.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [windowWidth, settledIndex, isResizingRef, flatListRef, scrollPage, lastEmittedPage]);

  const emitScroll = useCallback((x: number) => {
    onScroll({ nativeEvent: { contentOffset: { x } } });
  }, [onScroll]);

  // Runs on the UI thread so the title keeps up with the pager even while JS is
  // busy. `onScroll` only reacts to whole-page changes, so it is bridged back to
  // JS on day crossings instead of every frame.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const page = event.contentOffset.x / windowWidth;
      scrollPage.value = page;

      const rounded = Math.round(page);
      if (rounded !== lastEmittedPage.value) {
        lastEmittedPage.value = rounded;
        runOnJS(emitScroll)(event.contentOffset.x);
      }
    },
  });

  const settleAt = useCallback((offsetX: number) => {
    const index = Math.round(offsetX / windowWidth);
    setSettledIndex(previous => (previous === index ? previous : index));
  }, [windowWidth]);

  const handleMomentumScrollEnd = useCallback((e: any) => {
    onMomentumScrollEnd(e);
    settleAt(e.nativeEvent.contentOffset.x);
  }, [onMomentumScrollEnd, settleAt]);

  const handleScrollEndDrag = useCallback((e: any) => {
    settleAt(e.nativeEvent.contentOffset.x);
  }, [settleAt]);

  const handlePickDate = useCallback((picked: Date) => {
    handleDateChange(picked);
    setSettledIndex(getIndexFromDate(picked));
  }, [handleDateChange, getIndexFromDate]);

  const renderDay = useCallback(({ index }: { index: number }) => {
    const dayDate = getDateFromIndex(index);
    const normalizedDate = new Date(dayDate);
    normalizedDate.setHours(0, 0, 0, 0);
    const dayCourses = timetable.find(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === normalizedDate.getTime();
    })?.courses || [];

    return (
      <CalendarDay
        dayDate={dayDate}
        courses={dayCourses}
        isRefreshing={manualRefreshing}
        onRefresh={handleRefresh}
        colors={colors}
        insets={insets}
        tabBarHeight={tabBarHeight}
        transportInfo={account?.transport ?? undefined}
      />
    );
  }, [getDateFromIndex, timetable, manualRefreshing, handleRefresh, colors, insets, tabBarHeight, account]);

  return (
    <>
      <Calendar
        ref={calendarRef}
        date={date}
        onDateChange={handlePickDate}
        color="#D6502B"
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="calendar"
          onPress={() => calendarRef.current?.toggle()}
        >
          {dayLabel}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Title asChild>
        <View style={[styles.titleContainer, { width: screenWidth - 140 }]}>
          {TITLE_LAYER_OFFSETS.map(offset => {
            const pageIndex = settledIndex + offset;
            return (
              <TitleLayer
                key={pageIndex}
                page={scrollPage}
                pageIndex={pageIndex}
                labels={getDayLabels(getDateFromIndex(pageIndex))}
                slideDistance={screenWidth * TITLE_SLIDE_RATIO}
              />
            );
          })}
        </View>
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="ellipsis" />
          <Stack.Toolbar.Label>{t('Tab_Calendar_Icals')}</Stack.Toolbar.Label>
          <Stack.Toolbar.MenuAction
            icon="calendar"
            onPress={() => router.push({ pathname: "./calendar/icals", params: {} })}
          >
            {t('Tab_Calendar_Icals')}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Reanimated.FlatList
          ref={flatListRef}
          data={Array.from({ length: 20001 })}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={INITIAL_INDEX}
          getItemLayout={(_, index) => ({ length: windowWidth, offset: windowWidth * index, index })}
          renderItem={renderDay}
          keyExtractor={(_, index) => "renderDay:" + String(index)}
          onScroll={scrollHandler}
          decelerationRate={Platform.OS === 'ios' ? 0.98 : undefined}
          disableIntervalMomentum={true}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleScrollEndDrag}
          snapToInterval={windowWidth}
          bounces={false}
          windowSize={4}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          extraData={{ manualRefreshing, colors, timetable }}
        />
      </View>
    </>
  );
}

const CalendarScreenWithBoundary = () => (
  <MainTabErrorBoundary>
    <TabOneScreen />
  </MainTabErrorBoundary>
);

export default CalendarScreenWithBoundary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Fixed size, so the header title view never re-measures when the labels swap
  // or the subtitle comes and goes. Every layer is centered in this same box.
  titleContainer: {
    height: 44,
  },
  titleLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSubtitle: {
    marginTop: -2,
  },
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
