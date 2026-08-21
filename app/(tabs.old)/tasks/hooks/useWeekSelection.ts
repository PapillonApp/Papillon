import { useState, useCallback } from 'react';
import { getWeekNumberFromDate } from "@/database/useHomework";
import { trackAdvancedEvent } from '@/utils/logger/analytics';

export const useWeekSelection = () => {
  const currentDate = new Date();
  const defaultWeek = getWeekNumberFromDate(currentDate);
  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeek);
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  const onSelectWeek = useCallback((week: number) => {
    setSelectedWeek(week);
    trackAdvancedEvent("tasks_week_changed");
  }, []);

  return {
    defaultWeek,
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
  };
};
