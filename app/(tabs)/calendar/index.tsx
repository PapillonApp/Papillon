import React, { useRef, useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarDay } from "./components/CalendarDay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";

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
    handleRefresh
  } = useTimetableData(weekNumber);

  const renderDay = useCallback(({ index }: { index: number }) => {
    const dayDate = getDateFromIndex(index);
    return (
      <CalendarDay
        dayDate={dayDate}
        timetable={timetable}
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
          extraData={{ manualRefreshing, headerHeight, colors, date, weekNumber, timetable }}
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