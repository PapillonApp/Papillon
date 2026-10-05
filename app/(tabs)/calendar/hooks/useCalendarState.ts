import { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList } from 'react-native';
import { getWeekNumberFromDate } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";
import { trackAdvancedEvent } from "@/utils/logger/analytics";

const INITIAL_INDEX = 10000;

export type CalendarState = ReturnType<typeof useCalendarState>;

/**
 * `viewportWidth` is the width the pager actually has, measured rather than read
 * off the window: on iPad the tab bar becomes a sidebar, so the screen is
 * narrower than the window it sits in, and a page is narrower with it.
 */
export function useCalendarState(viewportWidth: number) {
  const [date, setDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(getWeekNumberFromDate(date));
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const lastTrackedDateKey = useRef<string>("");
  const flatListRef = useRef<FlatList<any>>(null);
  const referenceDate = useRef(new Date());
  const windowWidth = viewportWidth;
  // Set while the pager is being re-laid out after a window resize. Scroll
  // offsets are meaningless until the correction scroll lands, so they must not
  // be turned into a new date.
  const isResizingRef = useRef(false);
  // Last index `onScroll` reported. Also realigned whenever the date is set from
  // outside the pager, so the next crossing is never mistaken for a no-op.
  const lastEmittedIndex = useRef(INITIAL_INDEX);

  useEffect(() => {
    referenceDate.current.setHours(0, 0, 0, 0);
  }, []);

  useEffect(() => {
    const dateKey = new Date(date).toDateString();
    if (lastTrackedDateKey.current === dateKey) {
      return;
    }
    lastTrackedDateKey.current = dateKey;
    trackAdvancedEvent("calendar_day_changed");
  }, [date]);

  const getDateFromIndex = useCallback((index: number) => {
    const d = new Date(referenceDate.current);
    d.setDate(referenceDate.current.getDate() + (index - INITIAL_INDEX));
    return d;
  }, []);

  const getIndexFromDate = useCallback((d: Date) => {
    const base = new Date(referenceDate.current);
    base.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
    return INITIAL_INDEX + diff;
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate);
    const newWeekNumber = getWeekNumberFromDate(newDate);
    if (newWeekNumber !== weekNumber) {
      setWeekNumber(newWeekNumber);
    }
  }, [weekNumber]);

  // Sync FlatList with date
  useEffect(() => {
    const newIndex = getIndexFromDate(date);
    let newWeekNumber = getWeekNumberFromDate(date);

    if (date.getDay() === 0) {
      newWeekNumber += 1;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      lastEmittedIndex.current = newIndex;
      if (flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({
            index: newIndex,
            animated: false,
          });
        } catch (e) {
          warn(String(e))
        }
      }
    }

    if (newWeekNumber !== weekNumber) {
      setWeekNumber(newWeekNumber);
    }
  }, [date, getIndexFromDate, currentIndex, weekNumber]);

  const onMomentumScrollEnd = useCallback((e: any) => {
    if (isResizingRef.current) {return;}
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const newDate = getDateFromIndex(newIndex);
      setDate((prev) => prev.getTime() !== newDate.getTime() ? newDate : prev);
    }
  }, [windowWidth, currentIndex, getDateFromIndex]);

  const onScroll = useCallback((e: any) => {
    if (isResizingRef.current) {return;}
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / windowWidth);
    if (newIndex !== lastEmittedIndex.current) {
      lastEmittedIndex.current = newIndex;
      setCurrentIndex(newIndex);
      const newDate = getDateFromIndex(newIndex);
      setDate((prev) => prev.getTime() !== newDate.getTime() ? newDate : prev);
      const newWeekNumber = getWeekNumberFromDate(newDate);
      if (newWeekNumber !== weekNumber) {
        setWeekNumber(newWeekNumber);
      }
    }
  }, [windowWidth, getDateFromIndex, weekNumber]);

  return {
    date,
    setDate,
    weekNumber,
    setWeekNumber,
    currentIndex,
    flatListRef,
    getDateFromIndex,
    getIndexFromDate,
    handleDateChange,
    onMomentumScrollEnd,
    onScroll,
    isResizingRef,
    INITIAL_INDEX,
    windowWidth
  };
}
