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
  columns: number;
  daysPerWeek: number;
  dayWidth: number;
  pageWidth: number;
  hourGutterWidth: number;
  leftInset: number;
  rightInset: number;
  dayIndexOfPage: (pageIndex: number) => number;
  dayIndexOfDate: (date: Date) => number;
  dateOfDayIndex: (dayIndex: number) => Date;
  scrollXOfDayIndex: (dayIndex: number) => number;
  pageOfDate: (date: Date) => number;
  pageContainsDate: (pageIndex: number, date: Date) => boolean;
}

export function useWeekGeometry(weekend: WeekendVisibility, viewportWidth: number): WeekGeometry {
  const insets = useSafeAreaInsets();

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
