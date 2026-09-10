import { Stack, useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useCallback, useRef } from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";
import Calendar, { CalendarRef } from "@/ui/components/Calendar";
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import i18n from "@/utils/i18n";
import { useFont } from "@/utils/theme/fonts";

import { CalendarDay } from "./components/CalendarDay";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";

function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const papillonFont = useFont();
  const calendarRef = useRef<CalendarRef>(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount)!;

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
  } = useTimetableData(weekNumber, date);

  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = date.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  const isTomorrow = date.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  const dayLabel = isToday
    ? t("Today")
    : isYesterday
      ? t("Yesterday")
      : isTomorrow
        ? t("Tomorrow")
        : date.toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" });

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
        onDateChange={handleDateChange}
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

      <Stack.Title
        style={{ fontFamily: papillonFont('semibold') }}
      >
        {t('Tab_Calendar')}
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
