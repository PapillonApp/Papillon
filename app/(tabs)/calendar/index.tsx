import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet,View } from "react-native";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";

import { CalendarDay } from "./components/CalendarDay";
import { CalendarHeader } from "./components/CalendarHeader";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";

export default function TabOneScreen() {
  const { colors } = useTheme();
  const calendarRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 66);
  const tabBarHeight = useBottomTabBarHeight();

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = React.useMemo(
    () => accounts.find((a) => a.id === lastUsedAccount) ?? null,
    [accounts, lastUsedAccount]
  );

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
        transportInfo={account.transport ?? undefined}
        transportInfo={account?.transport ?? undefined}
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