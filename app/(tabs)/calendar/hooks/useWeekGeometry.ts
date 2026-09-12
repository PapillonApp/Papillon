import { useCallback, useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  dateFromDayIndex,
  dayIndexFromDate,
  getColumnCount,
  HOUR_GUTTER_WIDTH,
  PAGE_ORIGIN,
  startOfWeek,
  visibleDayOffsets,
  type WeekendVisibility,
} from "../utils/weekGeometry";

export interface WeekGeometry {
  /** Days shown side by side. Grows with the window, up to a full week. */
  columns: number;
  /** Days a week contributes to the grid: five, or more when a weekend is shown. */
  daysPerWeek: number;
  dayWidth: number;
  /** Width of one pager page, which is the whole grid minus the hour gutter. */
  pageWidth: number;
  hourGutterWidth: number;
  /**
   * Safe-area padding keeping the grid clear of a notch. Kept per side: they
   * are rarely equal, and padding both by the larger one wastes a column's
   * worth of space on the side that needed nothing.
   */
  leftInset: number;
  rightInset: number;
  /** Absolute day index of the first day of a pager page. */
  dayIndexOfPage: (pageIndex: number) => number;
  dayIndexOfDate: (date: Date) => number;
  dateOfDayIndex: (dayIndex: number) => Date;
  /**
   * Where a day sits along the pager's scroll axis. Day indices are counted
   * from the origin and go negative; the pager's own offsets start at page
   * zero, so the two spaces are a whole `PAGE_ORIGIN` of pages apart.
   */
  scrollXOfDayIndex: (dayIndex: number) => number;
  /** Pager page holding `date`. */
  pageOfDate: (date: Date) => number;
  /** Whether `date` is one of the days rendered by `pageIndex`. */
  pageContainsDate: (pageIndex: number, date: Date) => boolean;
}

/**
 * Turns the width the grid actually has into its geometry, and maps between
 * dates and pager pages.
 *
 * `viewportWidth` is measured rather than read off the window: on iPad the tab
 * bar becomes a sidebar, so the screen is narrower than the window it sits in.
 *
 * Days are indexed from the Monday of the week the screen was opened on, over
 * the days the grid actually draws: a weekend with no class anywhere in the
 * timetable takes no slot at all. So a page holds a whole week exactly when the
 * window is wide enough for every day of one, and narrower windows page through
 * the same sequence in fixed blocks.
 */
export function useWeekGeometry(weekend: WeekendVisibility, viewportWidth: number): WeekGeometry {
  const insets = useSafeAreaInsets();

  // Fixed for the lifetime of the screen: this is only the zero of the day
  // index, so it must not move under the pager while it is scrolled.
  const origin = useRef<Date | null>(null);
  if (origin.current === null) {
    origin.current = startOfWeek(new Date());
  }
  const originDate = origin.current;

  const showSaturday = weekend.saturday;
  const showSunday = weekend.sunday;
  const offsets = useMemo(
    () => visibleDayOffsets({ saturday: showSaturday, sunday: showSunday }),
    [showSaturday, showSunday]
  );
  const daysPerWeek = offsets.length;

  const leftInset = insets.left;
  const rightInset = insets.right;
  const available = Math.max(0, viewportWidth - leftInset - rightInset - HOUR_GUTTER_WIDTH);
  const columns = getColumnCount(available, daysPerWeek);
  const dayWidth = available / columns;

  const dayIndexOfPage = useCallback(
    (pageIndex: number) => (pageIndex - PAGE_ORIGIN) * columns,
    [columns]
  );

  const dayIndexOfDate = useCallback(
    (date: Date) => dayIndexFromDate(originDate, date, offsets),
    [originDate, offsets]
  );

  const dateOfDayIndex = useCallback(
    (dayIndex: number) => dateFromDayIndex(originDate, dayIndex, offsets),
    [originDate, offsets]
  );

  const scrollXOfDayIndex = useCallback(
    (dayIndex: number) => (dayIndex + PAGE_ORIGIN * columns) * dayWidth,
    [columns, dayWidth]
  );

  const pageOfDate = useCallback(
    (date: Date) => PAGE_ORIGIN + Math.floor(dayIndexFromDate(originDate, date, offsets) / columns),
    [originDate, offsets, columns]
  );

  const pageContainsDate = useCallback(
    (pageIndex: number, date: Date) => {
      const start = dayIndexOfPage(pageIndex);
      const index = dayIndexFromDate(originDate, date, offsets);
      return index >= start && index < start + columns;
    },
    [dayIndexOfPage, originDate, offsets, columns]
  );

  return useMemo(
    () => ({
      columns,
      daysPerWeek,
      dayWidth,
      pageWidth: dayWidth * columns,
      hourGutterWidth: HOUR_GUTTER_WIDTH,
      leftInset,
      rightInset,
      dayIndexOfPage,
      dayIndexOfDate,
      dateOfDayIndex,
      scrollXOfDayIndex,
      pageOfDate,
      pageContainsDate,
    }),
    [
      columns,
      daysPerWeek,
      dayWidth,
      leftInset,
      rightInset,
      dayIndexOfPage,
      dayIndexOfDate,
      dateOfDayIndex,
      scrollXOfDayIndex,
      pageOfDate,
      pageContainsDate,
    ]
  );
}
