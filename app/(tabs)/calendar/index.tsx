import { Stack, useRouter } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import type { CalendarViewMode } from "@/stores/settings/types";
import Calendar, { CalendarRef } from "@/ui/components/Calendar";
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import Typography from '@/ui/new/Typography';
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import useResizable from "@/ui/utils/Resizable";
import i18n from "@/utils/i18n";

import Reanimated, { useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";

import { AndroidHeaderButton, AndroidHeaderMenu } from "@/components/AndroidHeaderItems";

import { DayPager } from "./components/DayPager";
import { WeekView } from "./components/WeekView";
import { useCalendarState } from "./hooks/useCalendarState";
import { useTimetableData } from "./hooks/useTimetableData";
import { useWeekGeometry, type WeekGeometry } from "./hooks/useWeekGeometry";
import { useWeekendVisibility } from "./hooks/useWeekendVisibility";

const isAndroid = Platform.OS === "android";

const TITLE_SLIDE_RATIO = 0.4; // Slide this share of the screen width when changing titles

// Geometry of the leading toolbar button, which the date popover points at. The
// button is native and cannot host a SwiftUI anchor, so the popover hangs off an
// invisible strip centered on this box instead, and the box has to be restated
// here rather than measured.
const TOOLBAR_BUTTON_INSET = 40;
const TOOLBAR_BUTTON_SIZE = 40;

interface DayLabels {
  main: string;
  relative?: string;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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

/**
 * Title of one page of the weekly grid: the month its days fall in, or both
 * months when the page straddles a boundary.
 */
function getWeekLabels(geometry: WeekGeometry, pageIndex: number): DayLabels {
  const firstDayIndex = geometry.dayIndexOfPage(pageIndex);
  const first = geometry.dateOfDayIndex(firstDayIndex);
  const last = geometry.dateOfDayIndex(firstDayIndex + geometry.columns - 1);

  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return {
      main: capitalize(first.toLocaleDateString(i18n.language, { month: "long", year: "numeric" })),
    };
  }

  const sameYear = first.getFullYear() === last.getFullYear();
  const firstPart = first.toLocaleDateString(
    i18n.language,
    sameYear ? { month: "short" } : { month: "short", year: "numeric" }
  );
  const lastPart = last.toLocaleDateString(i18n.language, { month: "short", year: "numeric" });

  return { main: `${capitalize(firstPart)} – ${capitalize(lastPart)}` };
}

/** Short form of a day, for the toolbar button that opens the date picker. */
function getToolbarLabel(day: Date, compact: boolean): string {
  const labels = getDayLabels(day);
  if (labels.relative) {
    return labels.relative;
  }
  if (compact) {
    return day.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  }
  return labels.main;
}

// One title per page around the settled one. Keyed by absolute page index, so a
// layer is never remounted while it is on screen.
const TITLE_LAYER_OFFSETS = [-2, -1, 0, 1, 2];

// `pageIndex` is the page this layer renders, as an index into the pager.
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
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount);

  const { isTablet } = useResizable();
  const storedViewMode = useSettingsStore(state => state.personalization.calendarViewMode);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  // A screen that fits a whole week opens in the grid; a phone opens in the
  // list. Only the first visit decides: the choice is written back as if it had
  // been made from the menu, so putting the app in a narrow split view later
  // never swaps the mode out from under the user.
  const viewMode = storedViewMode ?? (isTablet ? "week" : "list");
  const isWeekMode = viewMode === "week";

  const setViewMode = useCallback((mode: CalendarViewMode) => {
    mutateProperty("personalization", { calendarViewMode: mode });
  }, [mutateProperty]);

  useEffect(() => {
    if (storedViewMode === undefined) {
      setViewMode(viewMode);
    }
  }, [storedViewMode, viewMode, setViewMode]);

  // The width the calendar actually gets, not the width of the window it is in:
  // on iPad the tab bar turns into a sidebar and takes a slice of the window
  // with it, which the window dimensions know nothing about.
  //
  // Null until it has been measured, and neither pager is mounted before then.
  // A pager's scroll offset is a page index times the page width, so mounting it
  // at a guessed width and correcting afterwards would leave an offset that
  // reads back as a date decades away.
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = Math.round(event.nativeEvent.layout.width);
    setContentWidth(previous => (previous === measured || measured <= 0 ? previous : measured));
  }, []);

  const calendar = useCalendarState(contentWidth ?? screenWidth);
  const { date, weekNumber, getDateFromIndex, getIndexFromDate, handleDateChange } = calendar;

  const {
    timetable,
    manualRefreshing,
    handleRefresh,
    error: timetableError,
    failures: timetableFailures,
  } = useTimetableData(weekNumber, date);

  // Weekend columns are dropped until the timetable shows a class on one, so a
  // Monday-to-Friday week does not spend a third of the screen on empty days.
  const weekend = useWeekendVisibility(timetable);
  const weekGeometry = useWeekGeometry(weekend, contentWidth ?? screenWidth);

  const hasTimetableError = Boolean(timetableError) || timetableFailures.length > 0;

  // Both modes page horizontally, but through different units: one day per page
  // in the list, one block of days per page in the grid. Everything the header
  // animates is expressed in the active mode's page index.
  const pageIndexOfDate = useCallback((day: Date) => (
    isWeekMode ? weekGeometry.pageOfDate(day) : getIndexFromDate(day)
  ), [isWeekMode, weekGeometry, getIndexFromDate]);

  const dateOfPageIndex = useCallback((pageIndex: number) => (
    isWeekMode
      ? weekGeometry.dateOfDayIndex(weekGeometry.dayIndexOfPage(pageIndex))
      : getDateFromIndex(pageIndex)
  ), [isWeekMode, weekGeometry, getDateFromIndex]);

  // The header is rebuilt natively whenever its options change, so the title and
  // the toolbar label are anchored to the last *settled* page instead of the live
  // one: nothing in the header changes while a swipe is in flight.
  const [settledIndex, setSettledIndex] = useState(() => pageIndexOfDate(date));

  // The pager's live scroll position, in pages. Each title layer is anchored to
  // the absolute index of the page it renders, so a page keeps the same position
  // and opacity across a relabel.
  const scrollPage = useSharedValue(settledIndex);

  // Switching modes — or resizing the window so a grid page holds a different
  // number of days — redefines what a page index means. Re-anchor the header on
  // the day that is on screen rather than carrying the old index over.
  // Must name everything the grid's pager is remounted on, so the header
  // re-anchors on the same day the pager does.
  const pageSpace = isWeekMode
    ? `week:${weekGeometry.columns}:${weekGeometry.daysPerWeek}:${Math.round(weekGeometry.pageWidth)}`
    : "list";
  const previousPageSpace = useRef(pageSpace);
  useLayoutEffect(() => {
    if (previousPageSpace.current === pageSpace) {
      return;
    }
    previousPageSpace.current = pageSpace;
    const index = pageIndexOfDate(date);
    setSettledIndex(index);
    scrollPage.value = index;
  }, [pageSpace, pageIndexOfDate, date, scrollPage]);

  const toolbarLabel = getToolbarLabel(dateOfPageIndex(settledIndex), isWeekMode);

  // Kept referentially stable so the memoized Calendar is not re-rendered, and
  // its SwiftUI host not re-fed props, on every page crossing.
  const calendarAnchor = useMemo(() => ({
    top: runsIOS26 ? headerHeight : 0,
    left: TOOLBAR_BUTTON_INSET,
    width: TOOLBAR_BUTTON_SIZE,
  }), [headerHeight]);

  const handlePickDate = useCallback((picked: Date) => {
    handleDateChange(picked);
    setSettledIndex(pageIndexOfDate(picked));
  }, [handleDateChange, pageIndexOfDate]);

  // A grid page carries a whole block of days, so the loaded week is anchored on
  // its first day — unless the day already chosen is one of the days it shows,
  // which keeps a date picked from the header selected.
  const anchorWeekOnPage = useCallback((page: number) => {
    if (weekGeometry.pageContainsDate(page, date)) {
      return;
    }
    handleDateChange(weekGeometry.dateOfDayIndex(weekGeometry.dayIndexOfPage(page)));
  }, [weekGeometry, handleDateChange, date]);

  const handleWeekPageSettled = useCallback((page: number) => {
    setSettledIndex(previous => (previous === page ? previous : page));
    anchorWeekOnPage(page);
  }, [anchorWeekOnPage]);

  const handleListSettle = useCallback((index: number) => {
    setSettledIndex(previous => (previous === index ? previous : index));
  }, []);

  const labelsOfPage = useCallback((pageIndex: number) => (
    isWeekMode ? getWeekLabels(weekGeometry, pageIndex) : getDayLabels(getDateFromIndex(pageIndex))
  ), [isWeekMode, weekGeometry, getDateFromIndex]);

  const openIcals = useCallback(() => {
    router.push({ pathname: "./calendar/icals", params: {} });
  }, [router]);

  return (
    <>
      <Calendar
        ref={calendarRef}
        date={date}
        onDateChange={handlePickDate}
        color="#D6502B"
        anchor={calendarAnchor}
      />

      {isAndroid ? (
        <Stack.Toolbar placement="left" asChild>
          <AndroidHeaderButton
            icon="Calendar"
            accessibilityLabel={toolbarLabel}
            onPress={() => calendarRef.current?.toggle()}
          />
        </Stack.Toolbar>
      ) : (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon="calendar"
            onPress={() => calendarRef.current?.toggle()}
          >
            {toolbarLabel}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      )}

      <Stack.Title asChild>
        <View style={[styles.titleContainer, { width: (contentWidth ?? screenWidth) - (Platform.OS === "android" ? 72 : 140) }]}>
          {TITLE_LAYER_OFFSETS.map(offset => {
            const pageIndex = settledIndex + offset;
            return (
              <TitleLayer
                key={pageIndex}
                page={scrollPage}
                pageIndex={pageIndex}
                labels={labelsOfPage(pageIndex)}
                slideDistance={(contentWidth ?? screenWidth) * TITLE_SLIDE_RATIO}
              />
            );
          })}
        </View>
      </Stack.Title>

      {isAndroid ? (
        <Stack.Toolbar placement="right" asChild>
          <AndroidHeaderMenu
            icon="Dots"
            accessibilityLabel={t('Tab_Calendar_View_Mode')}
            actions={[
              {
                id: "mode:list",
                title: t('Tab_Calendar_View_List'),
                papicon: "List",
                state: isWeekMode ? "off" : "on",
              },
              {
                id: "mode:week",
                title: t('Tab_Calendar_View_Week'),
                subtitle: t('Tab_Calendar_View_Beta'),
                papicon: "Grid",
                state: isWeekMode ? "on" : "off",
              },
              { id: "icals", title: t('Tab_Calendar_Icals'), papicon: "Calendar" },
            ]}
            onPressAction={({ nativeEvent }) => {
              if (nativeEvent.event === "icals") {
                openIcals();
                return;
              }
              setViewMode(nativeEvent.event === "mode:week" ? "week" : "list");
            }}
          />
        </Stack.Toolbar>
      ) : (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu>
            <Stack.Toolbar.Icon sf="ellipsis" />
            <Stack.Toolbar.Label>{t('Tab_Calendar_View_Mode')}</Stack.Toolbar.Label>
            <Stack.Toolbar.Menu inline title={t('Tab_Calendar_View_Mode')}>
              <Stack.Toolbar.MenuAction
                icon="list.bullet"
                isOn={!isWeekMode}
                onPress={() => setViewMode("list")}
              >
                {t('Tab_Calendar_View_List')}
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction
                icon="calendar.day.timeline.left"
                isOn={isWeekMode}
                subtitle={t('Tab_Calendar_View_Beta')}
                onPress={() => setViewMode("week")}
              >
                {t('Tab_Calendar_View_Week')}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.MenuAction
              icon="calendar"
              onPress={openIcals}
            >
              {t('Tab_Calendar_Icals')}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )}

      <View style={styles.content} onLayout={handleContentLayout}>
        {contentWidth === null ? null : isWeekMode ? (
          <WeekView
            // Both the page width and the days a page holds define the pager's
            // scroll space. Remounting on either is what re-anchors it on the
            // day on screen, instead of reading a stale offset back through the
            // new geometry as a page years away.
            key={`${weekGeometry.columns}:${Math.round(weekGeometry.pageWidth)}`}
            date={date}
            timetable={timetable}
            geometry={weekGeometry}
            isRefreshing={manualRefreshing}
            onRefresh={handleRefresh}
            hasError={hasTimetableError}
            scrollPage={scrollPage}
            onPageCrossed={anchorWeekOnPage}
            onPageSettled={handleWeekPageSettled}
            topInset={runsIOS26 ? headerHeight : 0}
            bottomInset={insets.bottom}
          />
        ) : (
          <DayPager
            calendar={calendar}
            timetable={timetable}
            isRefreshing={manualRefreshing}
            onRefresh={handleRefresh}
            hasError={hasTimetableError}
            transportInfo={account?.transport ?? undefined}
            settledIndex={settledIndex}
            onSettle={handleListSettle}
            scrollPage={scrollPage}
          />
        )}
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
  content: {
    flex: 1,
  },
  // Fixed size, so the header title view never re-measures when the labels swap
  // or the subtitle comes and goes. Every layer fills this same box.
  titleContainer: {
    height: 44,
  },
  titleLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // Android headers align their title to the leading edge; iOS centers it.
    alignItems: Platform.OS === "android" ? "flex-start" : "center",
    paddingHorizontal: Platform.OS === "android" ? 10 : 0,
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
