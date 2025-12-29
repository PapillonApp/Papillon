import { useCallback, useEffect, useMemo,useRef, useState } from 'react';

import { useTimetable } from '@/database/useTimetable';
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { useAccountStore } from '@/stores/account';
import { log, warn } from "@/utils/logger/logger";

export function useTimetableData(weekNumber: number, currentDate: Date = new Date()) {
  const safeDate = currentDate;
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [fetchedWeeks, setFetchedWeeks] = useState<string[]>([]);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let manager: ReturnType<typeof getManager> | null;

  try {
    manager = getManager();
  } catch (error) {
    warn('Manager not initialized, iCal events will still work');
    manager = null;
  }

  const store = useAccountStore.getState();
  const account = store.accounts.find(account => store.lastUsedAccount);
  const services: string[] = account?.services?.map((service: { id: string }) => service.id) ?? [];
  
  const rawTimetable = useTimetable(refresh, [weekNumber - 1, weekNumber, weekNumber + 1], safeDate);
  
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

        const candidates = [targetWeekNumber - 1, targetWeekNumber, targetWeekNumber + 1].map(week => {
          const targetDate = new Date(safeDate);
          targetDate.setDate(targetDate.getDate() + (week - targetWeekNumber) * 7);
          const year = targetDate.getFullYear();
          const key = `${year}-${week}`;
          return { week, targetDate, key };
        });

        const toFetch = candidates.filter(c => !fetchedWeeks.includes(c.key));

        if (toFetch.length > 0) {
          await Promise.all(
            toFetch.map((c) => {
              return manager.getWeeklyTimetable(c.week, c.targetDate)
            })
          );

          setRefresh(prev => prev + 1);
          setFetchedWeeks((prevFetchedWeeks) => [
            ...prevFetchedWeeks,
            ...toFetch.map(c => c.key),
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
  }, [fetchedWeeks, manager, safeDate]);

  useEffect(() => {
    fetchWeeklyTimetable(weekNumber);
  }, [weekNumber, fetchWeeklyTimetable]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      if (updatedManager) {
        fetchWeeklyTimetable(weekNumber);
      }
    });
    return () => unsubscribe();
  }, [weekNumber, fetchWeeklyTimetable]);

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
