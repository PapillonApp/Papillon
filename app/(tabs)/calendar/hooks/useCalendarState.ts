import { useState, useRef, useEffect, useCallback } from 'react';
import { Dimensions, FlatList } from 'react-native';
import { getWeekNumberFromDate } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

const INITIAL_INDEX = 10000;

export function useCalendarState() {
  const [date, setDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(getWeekNumberFromDate(date));
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const flatListRef = useRef<FlatList<any>>(null);
  const referenceDate = useRef(new Date());
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    referenceDate.current.setHours(0, 0, 0, 0);
  }, []);

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
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const newDate = getDateFromIndex(newIndex);
      setDate((prev) => prev.getTime() !== newDate.getTime() ? newDate : prev);
    }
  }, [windowWidth, currentIndex, getDateFromIndex]);

  const lastEmittedIndex = useRef(currentIndex);

  const onScroll = useCallback((e: any) => {
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
    INITIAL_INDEX,
    windowWidth
  };
}
