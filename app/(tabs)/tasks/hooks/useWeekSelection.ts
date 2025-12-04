import { useState, useCallback } from 'react';
import { getWeekNumberFromDate } from "@/database/useHomework";

export const useWeekSelection = () => {
  const currentDate = new Date();
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumberFromDate(currentDate));
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  const onSelectWeek = useCallback((week: number) => {
    setSelectedWeek(week);
  }, []);

  return {
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
  };
};
