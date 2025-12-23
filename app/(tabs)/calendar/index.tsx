import React, { useRef, useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarDay } from "./components/CalendarDay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";
import { CourseStatus } from "@/services/shared/timetable";
import { t } from "i18next";

export default function TabOneScreen() {
  const { colors } = useTheme();
  const calendarRef = useRef<any>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

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
    manualRefreshing,
    handleRefresh,
    isLoading
  } = useTimetableData(weekNumber, date);

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
          data={Array.from({ length: 20001 })}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={INITIAL_INDEX}
          getItemLayout={(_, index) => ({ length: windowWidth, offset: windowWidth * index, index })}
          renderItem={renderDay}
          keyExtractor={(_, index) => "renderDay:" + String(index)}
          onScroll={onScroll}
          decelerationRate={0.98}
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
          extraData={{ manualRefreshing, headerHeight, colors, timetable }}
        />
      </View>
    </>
  );
}

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