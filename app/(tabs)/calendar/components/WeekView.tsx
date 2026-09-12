import { useTheme } from "expo-router/react-navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import type { Course, CourseDay } from "@/services/shared/timetable";
import { useSettingsStore } from "@/stores/settings";
import i18n from "@/utils/i18n";
import { useFont } from "@/utils/theme/fonts";

import type { WeekGeometry } from "../hooks/useWeekGeometry";
import {
  BASE_HOUR_HEIGHT,
  clampHourHeight,
  DAY_HEADER_HEIGHT,
  DEFAULT_HOUR_RANGE,
  getHourRange,
  HALF_HOUR_LINE_THRESHOLD,
  isSameDay,
  layoutDayCourses,
  MIN_BLOCK_HEIGHT,
  minutesIntoDay,
  PAGE_COUNT,
  startOfDay,
  type HourRange,
} from "../utils/weekGeometry";
import { EmptyCalendar } from "./EmptyCalendar";
import { WeekEventBlock } from "./WeekEventBlock";

const PAGES: undefined[] = Array.from({ length: PAGE_COUNT });

const HEADER_WINDOW_PAGES = 1;

const NOW_TICK_MS = 60_000;
const NOW_COLOR = "#FF3B30";

const NO_COURSES: Course[] = [];

function useGridHeightStyle(hourHeight: SharedValue<number>, hours: number) {
  return useAnimatedStyle(() => ({ height: hourHeight.value * hours }), [hours]);
}

export interface WeekViewProps {
  date: Date;
  timetable: CourseDay[];
  geometry: WeekGeometry;
  isRefreshing: boolean;
  onRefresh: () => void;
  hasError?: boolean;
  scrollPage: SharedValue<number>;
  onPageCrossed: (page: number) => void;
  onPageSettled: (page: number) => void;
  topInset: number;
  bottomInset: number;
}

interface DayColumnProps {
  courses: Course[];
  range: HourRange;
  width: number;
  hourHeight: number;
  separatorColor: string;
  startsWeek: boolean;
  weekSeparatorColor: string;
}

const DayColumn = React.memo(({
  courses,
  range,
  width,
  hourHeight,
  separatorColor,
  startsWeek,
  weekSeparatorColor,
}: DayColumnProps) => {
  const blocks = useMemo(() => layoutDayCourses(courses, range), [courses, range]);

  return (
    <View style={[styles.dayColumn, { width, borderLeftColor: startsWeek ? weekSeparatorColor : separatorColor }]}>
      {blocks.map(block => (
        <WeekEventBlock
          key={block.course.id}
          course={block.course}
          topRatio={block.topRatio}
          heightRatio={block.heightRatio}
          left={block.leftRatio * width}
          width={block.widthRatio * width}
          renderedHeight={Math.max(MIN_BLOCK_HEIGHT, (block.durationMinutes / 60) * hourHeight)}
          minHeight={MIN_BLOCK_HEIGHT}
        />
      ))}
    </View>
  );
});

DayColumn.displayName = "DayColumn";

interface WeekPageProps {
  pageIndex: number;
  geometry: WeekGeometry;
  coursesByDay: Map<number, Course[]>;
  range: HourRange;
  liveHourHeight: SharedValue<number>;
  hourHeight: number;
  separatorColor: string;
  weekSeparatorColor: string;
}

const WeekPage = React.memo(({
  pageIndex,
  geometry,
  coursesByDay,
  range,
  liveHourHeight,
  hourHeight,
  separatorColor,
  weekSeparatorColor,
}: WeekPageProps) => {
  const firstDayIndex = geometry.dayIndexOfPage(pageIndex);
  const heightStyle = useGridHeightStyle(liveHourHeight, range.endHour - range.startHour);

  const columns = [];
  for (let offset = 0; offset < geometry.columns; offset++) {
    const dayIndex = firstDayIndex + offset;
    const day = geometry.dateOfDayIndex(dayIndex);
    columns.push(
      <DayColumn
        key={dayIndex}
        courses={coursesByDay.get(startOfDay(day).getTime()) ?? NO_COURSES}
        range={range}
        width={geometry.dayWidth}
        hourHeight={hourHeight}
        separatorColor={separatorColor}
        startsWeek={day.getDay() === 1}
        weekSeparatorColor={weekSeparatorColor}
      />
    );
  }

  return (
    <Reanimated.View style={[styles.page, { width: geometry.pageWidth }, heightStyle]}>
      {columns}
    </Reanimated.View>
  );
});

WeekPage.displayName = "WeekPage";

interface DayHeaderCellProps {
  date: Date;
  width: number;
  isToday: boolean;
  textColor: string;
  primaryColor: string;
  backgroundColor: string;
  font: (name: string) => string;
}

const DayHeaderCell = React.memo(({
  date,
  width,
  isToday,
  textColor,
  primaryColor,
  backgroundColor,
  font,
}: DayHeaderCellProps) => {
  const weekday = date.toLocaleDateString(i18n.language, { weekday: "short" }).replace(".", "");
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <View style={[styles.headerCell, { width }]}>
      <Text
        numberOfLines={1}
        style={[
          styles.headerWeekday,
          {
            fontFamily: font("semibold"),
            color: isToday ? primaryColor : textColor + (isWeekend ? "55" : "99"),
          },
        ]}
      >
        {weekday.toUpperCase()}
      </Text>
      <View style={[styles.headerNumber, isToday && { backgroundColor: primaryColor }]}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: font("bold"),
            fontSize: 16,
            lineHeight: 19,
            color: isToday ? backgroundColor : textColor + (isWeekend ? "77" : "FF"),
          }}
        >
          {date.getDate()}
        </Text>
      </View>
    </View>
  );
});

DayHeaderCell.displayName = "DayHeaderCell";

export function WeekView({
  date,
  timetable,
  geometry,
  isRefreshing,
  onRefresh,
  hasError = false,
  scrollPage,
  onPageCrossed,
  onPageSettled,
  topInset,
  bottomInset,
}: WeekViewProps) {
  const { colors } = useTheme();
  const font = useFont();

  const listRef = useRef<FlatList<any>>(null);
  const verticalRef = useAnimatedRef<Reanimated.ScrollView>();

  const initialPage = useRef(geometry.pageOfDate(date)).current;
  const [windowPage, setWindowPage] = useState(initialPage);
  const currentPage = useRef(initialPage);

  const scrollX = useSharedValue(initialPage * geometry.pageWidth);
  const lastCrossedPage = useSharedValue(initialPage);

  // Read out here rather than inside the worklets below: a worklet captures the
  // whole identifier it reads through, and `geometry` carries closures that
  // cannot cross onto the UI thread.
  const pageWidth = geometry.pageWidth;

  const textColor = String(colors.text);
  const primaryColor = String(colors.primary);
  const backgroundColor = String(colors.background);
  const separatorColor = textColor + "14";
  const weekSeparatorColor = textColor + "33";

  const measuredRange = useMemo(() => getHourRange(timetable), [timetable]);
  const rangeRef = useRef(measuredRange);
  if (
    rangeRef.current.startHour !== measuredRange.startHour ||
    rangeRef.current.endHour !== measuredRange.endHour
  ) {
    rangeRef.current = measuredRange;
  }
  const range = rangeRef.current;
  const totalHours = range.endHour - range.startHour;

  const storedHourHeight = useSettingsStore(state => state.personalization.calendarHourHeight);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const [hourHeight, setHourHeight] = useState(() => clampHourHeight(storedHourHeight ?? BASE_HOUR_HEIGHT));
  const liveHourHeight = useSharedValue(hourHeight);
  const gridHeight = totalHours * hourHeight;
  const gridRowHeightStyle = useGridHeightStyle(liveHourHeight, totalHours);
  const pagerHeightStyle = useGridHeightStyle(liveHourHeight, totalHours);

  const coursesByDay = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const day of timetable) {
      map.set(startOfDay(day.date).getTime(), day.courses);
    }
    return map;
  }, [timetable]);

  const onPageCrossedRef = useRef(onPageCrossed);
  useEffect(() => {
    onPageCrossedRef.current = onPageCrossed;
  }, [onPageCrossed]);

  const handleCrossing = useCallback((page: number) => {
    currentPage.current = page;
    setWindowPage(previous => (previous === page ? previous : page));
    onPageCrossedRef.current(page);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      const position = event.contentOffset.x / pageWidth;
      scrollX.value = event.contentOffset.x;
      scrollPage.value = position;

      const rounded = Math.round(position);
      if (rounded !== lastCrossedPage.value) {
        lastCrossedPage.value = rounded;
        runOnJS(handleCrossing)(rounded);
      }
    },
  });

  const settleAt = useCallback((offsetX: number) => {
    const page = Math.round(offsetX / pageWidth);
    currentPage.current = page;
    onPageSettled(page);
  }, [pageWidth, onPageSettled]);

  const handleMomentumEnd = useCallback((event: any) => {
    settleAt(event.nativeEvent.contentOffset.x);
  }, [settleAt]);

  const handleDragEnd = useCallback((event: any) => {
    settleAt(event.nativeEvent.contentOffset.x);
  }, [settleAt]);

  useEffect(() => {
    if (geometry.pageContainsDate(currentPage.current, date)) {
      return;
    }
    const target = geometry.pageOfDate(date);
    currentPage.current = target;
    lastCrossedPage.value = target;
    scrollPage.value = target;
    scrollX.value = target * pageWidth;
    setWindowPage(target);
    listRef.current?.scrollToIndex({ index: target, animated: false });
  }, [date, geometry, pageWidth, lastCrossedPage, scrollPage, scrollX]);

  const hasUserScrolled = useRef(false);
  const lastAutoScrollKey = useRef("");

  useEffect(() => {
    if (hasUserScrolled.current || gridHeight <= 0) {
      return;
    }

    const key = `${windowPage}:${range.startHour}:${coursesByDay.size}`;
    if (lastAutoScrollKey.current === key) {
      return;
    }
    lastAutoScrollKey.current = key;

    const firstDayIndex = geometry.dayIndexOfPage(windowPage);
    const now = new Date();
    let targetMinutes: number | null = null;

    for (let offset = 0; offset < geometry.columns; offset++) {
      const day = geometry.dateOfDayIndex(firstDayIndex + offset);
      if (isSameDay(day, now)) {
        targetMinutes = minutesIntoDay(now) - 60;
        break;
      }
      for (const course of coursesByDay.get(startOfDay(day).getTime()) ?? NO_COURSES) {
        const start = minutesIntoDay(course.from);
        if (targetMinutes === null || start < targetMinutes) {
          targetMinutes = start;
        }
      }
    }

    if (targetMinutes === null) {
      targetMinutes = DEFAULT_HOUR_RANGE.startHour * 60;
    }

    const y = ((targetMinutes - range.startHour * 60) / 60) * hourHeight - 12;
    verticalRef.current?.scrollTo({
      y: Math.min(Math.max(0, y), Math.max(0, gridHeight - 1)),
      animated: false,
    });
  }, [windowPage, range.startHour, coursesByDay, geometry, gridHeight, hourHeight]);

  const takeOverScrolling = useCallback(() => {
    hasUserScrolled.current = true;
  }, []);

  const scrollY = useSharedValue(0);
  const verticalScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      runOnJS(takeOverScrolling)();
    },
  });

  const commitHourHeight = useCallback((value: number) => {
    const rounded = Math.round(value * 10) / 10;
    setHourHeight(previous => (previous === rounded ? previous : rounded));
    mutateProperty("personalization", { calendarHourHeight: rounded });
  }, [mutateProperty]);

  const pinchStartHourHeight = useSharedValue(hourHeight);
  const pinchStartScrollY = useSharedValue(0);
  const pinchFocalY = useSharedValue(0);

  const pinch = useMemo(() => Gesture.Pinch()
    .onStart(event => {
      pinchStartHourHeight.value = liveHourHeight.value;
      pinchStartScrollY.value = scrollY.value;
      pinchFocalY.value = event.focalY;
      runOnJS(takeOverScrolling)();
    })
    .onUpdate(event => {
      const next = clampHourHeight(pinchStartHourHeight.value * event.scale);
      liveHourHeight.value = next;

      const ratio = next / pinchStartHourHeight.value;
      const target = (pinchStartScrollY.value + pinchFocalY.value) * ratio - pinchFocalY.value;
      scrollTo(verticalRef, 0, Math.max(0, target), false);
    })
    .onEnd(() => {
      runOnJS(commitHourHeight)(liveHourHeight.value);
    }),
  [
    commitHourHeight,
    liveHourHeight,
    pinchFocalY,
    pinchStartHourHeight,
    pinchStartScrollY,
    scrollY,
    takeOverScrolling,
    verticalRef,
  ]);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), NOW_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const todayStart = startOfDay(now).getTime();
  const nowMinutes = minutesIntoDay(now);
  const todayHasColumn = startOfDay(geometry.dateOfDayIndex(geometry.dayIndexOfDate(now))).getTime() === todayStart;
  const nowVisible = todayHasColumn
    && nowMinutes >= range.startHour * 60
    && nowMinutes <= range.endHour * 60;
  const nowTopRatio = (nowMinutes - range.startHour * 60) / (totalHours * 60);
  const todayOffsetX = geometry.scrollXOfDayIndex(geometry.dayIndexOfDate(now));

  const nowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: todayOffsetX - scrollX.value }],
  }), [todayOffsetX]);

  const { cells: headerCells, offsetX: headerOffsetX } = useMemo(() => {
    const start = geometry.dayIndexOfPage(windowPage - HEADER_WINDOW_PAGES);
    const count = geometry.columns * (HEADER_WINDOW_PAGES * 2 + 1);
    const cells = [];
    for (let offset = 0; offset < count; offset++) {
      const dayIndex = start + offset;
      const day = geometry.dateOfDayIndex(dayIndex);
      cells.push(
        <DayHeaderCell
          key={dayIndex}
          date={day}
          width={geometry.dayWidth}
          isToday={startOfDay(day).getTime() === todayStart}
          textColor={textColor}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          font={font}
        />
      );
    }
    return { cells, offsetX: geometry.scrollXOfDayIndex(start) };
  }, [geometry, windowPage, todayStart, textColor, primaryColor, backgroundColor, font]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: headerOffsetX - scrollX.value }],
  }), [headerOffsetX]);

  const showHalfHours = hourHeight >= HALF_HOUR_LINE_THRESHOLD;

  const hourLines = useMemo(() => {
    const lines = [];
    for (let hour = range.startHour; hour <= range.endHour; hour++) {
      const step = hour - range.startHour;
      lines.push(
        <View
          key={hour}
          style={[
            styles.hourLine,
            { top: `${(step / totalHours) * 100}%`, backgroundColor: separatorColor },
          ]}
        />
      );
      if (showHalfHours && hour < range.endHour) {
        lines.push(
          <View
            key={`${hour}:30`}
            style={[
              styles.hourLine,
              { top: `${((step + 0.5) / totalHours) * 100}%`, backgroundColor: separatorColor, opacity: 0.5 },
            ]}
          />
        );
      }
    }
    return lines;
  }, [range, totalHours, separatorColor, showHalfHours]);

  const hourLabels = useMemo(() => {
    const labels = [];
    for (let hour = range.startHour; hour <= range.endHour; hour++) {
      labels.push(
        <Text
          key={hour}
          numberOfLines={1}
          style={[
            styles.hourLabel,
            {
              top: `${((hour - range.startHour) / totalHours) * 100}%`,
              color: textColor + "77",
              fontFamily: font("medium"),
            },
          ]}
        >
          {String(hour).padStart(2, "0")}:00
        </Text>
      );
    }
    return labels;
  }, [range, totalHours, textColor, font]);

  const renderPage = useCallback(({ index }: { index: number }) => (
    <WeekPage
      pageIndex={index}
      geometry={geometry}
      coursesByDay={coursesByDay}
      range={range}
      liveHourHeight={liveHourHeight}
      hourHeight={hourHeight}
      separatorColor={separatorColor}
      weekSeparatorColor={weekSeparatorColor}
    />
  ), [geometry, coursesByDay, range, liveHourHeight, hourHeight, separatorColor, weekSeparatorColor]);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: geometry.pageWidth,
    offset: geometry.pageWidth * index,
    index,
  }), [geometry.pageWidth]);

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: topInset }]}>
      <View style={styles.body}>
        <View
          style={[
            styles.headerRow,
            {
              backgroundColor,
              borderBottomColor: separatorColor,
              paddingLeft: geometry.leftInset,
              paddingRight: geometry.rightInset,
            },
          ]}
        >
          <View style={{ width: geometry.hourGutterWidth }} />
          <View style={[styles.headerViewport, { width: geometry.pageWidth }]}>
            <Reanimated.View style={[styles.headerStrip, headerStyle]}>
              {headerCells}
            </Reanimated.View>
          </View>
        </View>

        <GestureDetector gesture={pinch}>
          <Reanimated.ScrollView
            ref={verticalRef}
            style={styles.vertical}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: bottomInset + 16 }}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            directionalLockEnabled
            onScroll={verticalScrollHandler}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[primaryColor]}
                progressBackgroundColor={backgroundColor}
              />
            }
          >
            <Reanimated.View
              style={[
                styles.gridRow,
                { paddingLeft: geometry.leftInset, paddingRight: geometry.rightInset },
                gridRowHeightStyle,
              ]}
            >
              <View style={[styles.gutter, { width: geometry.hourGutterWidth }]}>
                {hourLabels}
              </View>

              <Reanimated.View style={[styles.pagerViewport, { width: geometry.pageWidth }, pagerHeightStyle]}>
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  {hourLines}
                </View>

                <Reanimated.FlatList
                  ref={listRef}
                  data={PAGES}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  initialScrollIndex={initialPage}
                  getItemLayout={getItemLayout}
                  renderItem={renderPage}
                  keyExtractor={(_, index) => "weekPage:" + String(index)}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={handleMomentumEnd}
                  onScrollEndDrag={handleDragEnd}
                  decelerationRate={Platform.OS === "ios" ? "fast" : undefined}
                  bounces={false}
                  style={{ width: geometry.pageWidth, height: "100%" }}
                  windowSize={3}
                  maxToRenderPerBatch={2}
                  initialNumToRender={2}
                  // Clipping is computed against the wrong viewport inside the
                  // vertical scroll; `windowSize` already caps what is mounted.
                  removeClippedSubviews={false}
                />

                {nowVisible && (
                  <Reanimated.View
                    pointerEvents="none"
                    style={[styles.nowLayer, { top: `${nowTopRatio * 100}%`, width: geometry.dayWidth }, nowStyle]}
                  >
                    <View style={[styles.nowDot, { backgroundColor: NOW_COLOR }]} />
                    <View style={[styles.nowLine, { backgroundColor: NOW_COLOR }]} />
                  </Reanimated.View>
                )}
              </Reanimated.View>
            </Reanimated.View>
          </Reanimated.ScrollView>
        </GestureDetector>

        {timetable.length === 0 && (
          <View pointerEvents="none" style={styles.emptyOverlay}>
            <EmptyCalendar hasError={hasError} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    height: DAY_HEADER_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerViewport: {
    height: DAY_HEADER_HEIGHT,
    overflow: "hidden",
  },
  headerStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
  },
  headerCell: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  headerWeekday: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.4,
  },
  headerNumber: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  vertical: {
    flex: 1,
  },
  gridRow: {
    flexDirection: "row",
  },
  gutter: {
    height: "100%",
  },
  hourLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  hourLabel: {
    position: "absolute",
    right: 6,
    fontSize: 11,
    lineHeight: 14,
    marginTop: -7,
  },
  pagerViewport: {
    overflow: "hidden",
  },
  page: {
    flexDirection: "row",
  },
  dayColumn: {
    height: "100%",
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  nowLayer: {
    position: "absolute",
    left: 0,
    height: 2,
    flexDirection: "row",
    alignItems: "center",
    marginTop: -1,
  },
  nowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: -3,
  },
  nowLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  emptyOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: DAY_HEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});
