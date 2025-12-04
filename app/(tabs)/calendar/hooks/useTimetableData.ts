import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { useTimetable } from '@/database/useTimetable';
import { useAccountStore } from '@/stores/account';
import { log, warn } from "@/utils/logger/logger";

export function useTimetableData(weekNumber: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [fetchedWeeks, setFetchedWeeks] = useState<number[]>([]);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let manager: any;
  try {
    manager = getManager();
  } catch (error) {
    console.warn('Manager not initialized, iCal events will still work');
    manager = null;
  }

  const store = useAccountStore.getState();
  const account = store.accounts.find(account => store.lastUsedAccount);
  const services: string[] = account?.services?.map((service: { id: string }) => service.id) ?? [];
  
  const rawTimetable = useTimetable(refresh, [weekNumber - 1, weekNumber, weekNumber + 1]);
  
  const timetable = useMemo(() => {
    return rawTimetable.map(day => ({
      ...day,
      courses: day.courses.filter(course =>
        services.includes(course.createdByAccount) || course.createdByAccount.startsWith('ical_')
      )
    })).filter(day => day.courses.length > 0);
  }, [rawTimetable, services]);

  const fetchWeeklyTimetable = useCallback(async (targetWeekNumber: number, forceRefresh = false) => {
    setIsLoading(true);
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      if (forceRefresh) {
        setManualRefreshing(true);
      }
      try {
        if (!manager) {
          warn('Manager is null, skipping timetable fetch');
          return;
        }

        const weeksToFetch = [targetWeekNumber - 1, targetWeekNumber, targetWeekNumber + 1].filter(
          (week) => !fetchedWeeks.includes(week)
        );

        if (weeksToFetch.length > 0) {
          await Promise.all(
            weeksToFetch.map((week) => manager.getWeeklyTimetable(week))
          );

          setRefresh(prev => prev + 1);
          setFetchedWeeks((prevFetchedWeeks) => [
            ...prevFetchedWeeks,
            ...weeksToFetch,
          ]);
        }
      } catch (error) {
        log('Error fetching weekly timetable: ' + error);
      } finally {
        setIsLoading(false);
        setManualRefreshing(false);
        fetchTimeoutRef.current = null;
      }
    }, 100);
  }, [fetchedWeeks, manager]);

  useEffect(() => {
    fetchWeeklyTimetable(weekNumber);
  }, [weekNumber]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      if (updatedManager) {
        fetchWeeklyTimetable(weekNumber);
      }
    });
    return () => unsubscribe();
  }, [weekNumber]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefresh(prev => prev + 1);
    fetchWeeklyTimetable(weekNumber, true);
  }, [weekNumber]);

  return {
    timetable,
    refresh,
    manualRefreshing,
    handleRefresh,
    isLoading
  };
}
