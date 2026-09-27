import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet,View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseStatus } from "@/services/shared/timetable";

import { CalendarDay } from "./components/CalendarDay";
import { CalendarHeader } from "./components/CalendarHeader";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';

function TabOneScreen() {
  const { colors } = useTheme();
  const calendarRef = useRef<any>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;

  const {
    date,
    weekNumber,
    currentIndex,
    flatListRef,
    getDateFromIndex,
    handleDateChange,
    onMomentumScrollEnd,
    onScroll,
    INITIAL_INDEX,
    windowWidth
  } = useCalendarState();

  const {
    timetable,
    refresh,
    manualRefreshing,
    handleRefresh,
    isLoading
  } = useTimetableData(weekNumber, date);

  // Smart initial day: si journée d'école terminée → prochain jour avec cours,
  // sinon reste sur aujourd'hui. Une seule fois au chargement.
  const didSmartJump = useRef(false);
  useEffect(() => {
    if (didSmartJump.current || timetable.length === 0) return;
    const now = new Date();
    const todayKey = new Date(now).setHours(0, 0, 0, 0);
    const todayEntry = timetable.find(d => new Date(d.date).setHours(0, 0, 0, 0) === todayKey);
    if (!todayEntry || todayEntry.courses.length === 0) return;
    const lastEnd = todayEntry.courses.reduce((m, c) => {
      const end = new Date((c as { to?: unknown }).to ?? (c as { from?: unknown }).from).getTime();
      return Number.isFinite(end) && end > m ? end : m;
    }, 0);
    if (lastEnd > 0 && now.getTime() > lastEnd) {
      const next = timetable
        .map(d => new Date(d.date))
        .filter(d => d.setHours(0, 0, 0, 0) > todayKey)
        .sort((a, b) => a.getTime() - b.getTime())[0];
      if (next) {
        didSmartJump.current = true;
        handleDateChange(next);
      }
    }
  }, [timetable, handleDateChange]);

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
        headerHeight={headerHeight}
        insets={insets}
        tabBarHeight={tabBarHeight}
      />
    );
  }, [getDateFromIndex, timetable, manualRefreshing, handleRefresh, colors, headerHeight]);

  // Stable pager data: fixed 20001-day window, identity must not change per render.
  const pagerData = useMemo(() => Array.from({ length: 20001 }), []);
  // Stable extraData: new identity only when a dep actually changes.
  // `revision` (hook's refresh counter) covers refetch completion; `timetable`
  // covers filter/shape changes that don't bump the counter.
  const listExtraData = useMemo(
    () => ({
      manualRefreshing,
      headerHeight,
      backgroundColor: colors.background,
      timetable,
      revision: refresh,
    }),
    [manualRefreshing, headerHeight, colors.background, timetable, refresh]
  );

  return (
    <>
      <CalendarHeader
        date={date}
        onDateChange={handleDateChange}
        onHeaderHeightChange={setHeaderHeight}
        calendarRef={calendarRef}
        isLoading={isLoading}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          ref={flatListRef}
          data={pagerData}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={INITIAL_INDEX}
          getItemLayout={(_, index) => ({ length: windowWidth, offset: windowWidth * index, index })}
          renderItem={renderDay}
          keyExtractor={(_, index) => "renderDay:" + String(index)}
          onScroll={onScroll}
          decelerationRate={Platform.OS === 'ios' ? 0.98 : undefined}
          disableIntervalMomentum={true}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          snapToInterval={windowWidth}
          bounces={false}
          windowSize={4}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          extraData={listExtraData}
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
