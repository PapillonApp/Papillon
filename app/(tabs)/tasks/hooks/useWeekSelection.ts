import { useState, useCallback, useEffect, useRef } from 'react';
import { Dimensions, FlatList } from 'react-native';
import { getWeekNumberFromDate } from "@/database/useHomework";

const INITIAL_INDEX = 10000;

export const useWeekSelection = () => {
  const currentDate = new Date();
  const defaultWeek = getWeekNumberFromDate(currentDate);
  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeek);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const flatListRef = useRef<FlatList<number>>(null);
  const windowWidth = Dimensions.get("window").width;
  const referenceWeek = useRef(defaultWeek);
  const lastEmittedIndex = useRef(INITIAL_INDEX);

  const getWeekFromIndex = useCallback((index: number) => {
    return referenceWeek.current + (index - INITIAL_INDEX);
  }, []);

  const getIndexFromWeek = useCallback((week: number) => {
    return INITIAL_INDEX + (week - referenceWeek.current);
  }, []);

  useEffect(() => {
    const nextIndex = getIndexFromWeek(selectedWeek);
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: false,
      });
    }
  }, [currentIndex, getIndexFromWeek, selectedWeek]);

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  const onSelectWeek = useCallback((week: number) => {
    setSelectedWeek(week);
  }, []);

  const onMomentumScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      setSelectedWeek(getWeekFromIndex(nextIndex));
    }
  }, [currentIndex, getWeekFromIndex, windowWidth]);

  const onScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    if (nextIndex !== lastEmittedIndex.current) {
      lastEmittedIndex.current = nextIndex;
      setCurrentIndex(nextIndex);
      setSelectedWeek(getWeekFromIndex(nextIndex));
    }
  }, [getWeekFromIndex, windowWidth]);

  return {
    defaultWeek,
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
    currentIndex,
    flatListRef,
    getWeekFromIndex,
    getIndexFromWeek,
    onMomentumScrollEnd,
    onScroll,
    INITIAL_INDEX,
    windowWidth,
  };
};
