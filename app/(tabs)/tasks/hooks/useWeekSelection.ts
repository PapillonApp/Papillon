import { useCallback, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { trackAdvancedEvent } from '@/utils/logger/analytics';

import { getCurrentWeekIndex } from '../utils/weekGrid';

// Middle of the pager. Weeks are addressed relative to it, so page positions
// stay small numbers for as long as the screen is alive.
const INITIAL_INDEX = 1000;

export const useWeekSelection = () => {
  const { width: windowWidth } = useWindowDimensions();

  // The week the screen opened in. Captured once so a page index always maps to
  // the same week, even across midnight.
  const defaultWeek = useRef(getCurrentWeekIndex()).current;

  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeek);
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const getWeekFromIndex = useCallback(
    (index: number) => defaultWeek + (index - INITIAL_INDEX),
    [defaultWeek]
  );

  const getIndexFromWeek = useCallback(
    (week: number) => INITIAL_INDEX + (week - defaultWeek),
    [defaultWeek]
  );

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  const onSelectWeek = useCallback((week: number) => {
    setSelectedWeek((previous) => {
      if (previous === week) {
        return previous;
      }
      trackAdvancedEvent("tasks_week_changed");
      return week;
    });
  }, []);

  return {
    defaultWeek,
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
    getWeekFromIndex,
    getIndexFromWeek,
    windowWidth,
    INITIAL_INDEX,
  };
};
