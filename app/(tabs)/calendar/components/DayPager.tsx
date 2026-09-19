import { useTheme } from "expo-router/react-navigation";
import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import type { CourseDay } from "@/services/shared/timetable";
import type { TransportStorage } from "@/stores/account/types";

import type { CalendarState } from "../hooks/useCalendarState";
import { CalendarDay } from "./CalendarDay";

const DAYS: undefined[] = Array.from({ length: 20001 });

export interface DayPagerProps {
  calendar: CalendarState;
  timetable: CourseDay[];
  isRefreshing: boolean;
  onRefresh: () => void;
  hasError: boolean;
  transportInfo?: TransportStorage;
  settledIndex: number;
  onSettle: (index: number) => void;
  scrollPage: SharedValue<number>;
}

export function DayPager({
  calendar,
  timetable,
  isRefreshing,
  onRefresh,
  hasError,
  transportInfo,
  settledIndex,
  onSettle,
  scrollPage,
}: DayPagerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;

  const {
    flatListRef,
    getDateFromIndex,
    onMomentumScrollEnd,
    onScroll,
    isResizingRef,
    currentIndex,
    windowWidth,
  } = calendar;

  const initialIndex = useRef(currentIndex).current;

  const lastEmittedPage = useSharedValue(settledIndex);

  const dayColors = useMemo(() => ({
    primary: String(colors.primary),
    background: String(colors.background),
  }), [colors.primary, colors.background]);

  // A resize changes the page width under the pager: the scroll offset still
  // points at the old geometry and would read back as a completely different day.
  // Pin it back onto the settled day, and ignore every offset until it lands.
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

    // The list re-lays out its items a frame later, so the offset has to be reasserted.
    const frame = requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset, animated: false });
      isResizingRef.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [windowWidth, settledIndex, isResizingRef, flatListRef, scrollPage, lastEmittedPage]);

  const emitScroll = useCallback((x: number) => {
    onScroll({ nativeEvent: { contentOffset: { x } } });
  }, [onScroll]);

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
    onSettle(Math.round(offsetX / windowWidth));
  }, [windowWidth, onSettle]);

  const handleMomentumScrollEnd = useCallback((e: any) => {
    onMomentumScrollEnd(e);
    settleAt(e.nativeEvent.contentOffset.x);
  }, [onMomentumScrollEnd, settleAt]);

  const handleScrollEndDrag = useCallback((e: any) => {
    settleAt(e.nativeEvent.contentOffset.x);
  }, [settleAt]);

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
        width={windowWidth}
        courses={dayCourses}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        colors={dayColors}
        insets={insets}
        tabBarHeight={tabBarHeight}
        transportInfo={transportInfo}
        hasError={hasError}
      />
    );
  }, [getDateFromIndex, windowWidth, timetable, isRefreshing, onRefresh, dayColors, insets, tabBarHeight, transportInfo, hasError]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Reanimated.FlatList
        ref={flatListRef}
        data={DAYS}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
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
        extraData={{ isRefreshing, dayColors, timetable }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
