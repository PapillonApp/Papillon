import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTimetable } from '@/database/useTimetable';
import { useLoadErrorAlert } from '@/hooks/useLoadErrorAlert';
import { useManagerSubscription } from '@/hooks/useManagerSubscription';
import type { AccountManager } from "@/services/shared";
import { getManager } from "@/services/shared";
import { Capabilities, ServiceFailure } from "@/services/shared/types";
import { useAccountStore } from '@/stores/account';
import { debug, log } from "@/utils/logger/logger";

export function useTimetableData(weekNumber: number, currentDate: Date = new Date()) {
  const safeDate = currentDate;
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [failures, setFailures] = useState<ServiceFailure[]>([]);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Weeks are fetched once per session; a ref keeps a swipe back and forth from
  // re-running the effect that starts the fetch.
  const fetchedWeeks = useRef<Set<string>>(new Set());

  const [manager, setManager] = useState(() => getManager(true));

  // Read through selectors: switching accounts has to rebuild `services`, or the
  // filter below would keep matching the previous account and hide every course.
  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(item => item.id === lastUsedAccount);
  const services: string[] = useMemo(
    () => account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account]
  );

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
          debug('Manager is null, skipping timetable fetch');
          return;
        }

        const candidates = [targetWeekNumber - 1, targetWeekNumber, targetWeekNumber + 1].map(week => {
          const targetDate = new Date(safeDate);
          targetDate.setDate(targetDate.getDate() + (week - targetWeekNumber) * 7);
          const year = targetDate.getFullYear();
          const key = `${year}-${week}`;
          return { week, targetDate, key };
        });

        const toFetch = forceRefresh
          ? candidates
          : candidates.filter(c => !fetchedWeeks.current.has(c.key));

        if (toFetch.length > 0) {
          await Promise.all(
            toFetch.map((c) => {
              return manager.getWeeklyTimetable(c.week, c.targetDate)
            })
          );

          setRefresh(prev => prev + 1);
          for (const candidate of toFetch) {
            fetchedWeeks.current.add(candidate.key);
          }
        }

        // The manager falls back to the cache rather than throwing, so a service
        // that failed is only visible through its recorded failures.
        setFailures(manager.getFailures(Capabilities.TIMETABLE));
        setError(null);
      } catch (e) {
        log('Error fetching weekly timetable: ' + e);
        setFailures(manager?.getFailures(Capabilities.TIMETABLE) ?? []);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsLoading(false);
        setManualRefreshing(false);
        fetchTimeoutRef.current = null;
      }
    }, 100);
  }, [manager, safeDate]);

  useEffect(() => {
    fetchWeeklyTimetable(weekNumber);
  }, [weekNumber, fetchWeeklyTimetable]);

  const handleManager = useCallback((updatedManager: AccountManager) => {
    setManager(updatedManager);
    fetchedWeeks.current.clear();
    setError(null);
  }, []);

  const handleManagerUnavailable = useCallback(() => {
    setIsLoading(false);
    setManualRefreshing(false);
    setError(new Error("Account manager unavailable"));
  }, []);

  useManagerSubscription(handleManager, handleManagerUnavailable);

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
  }, [fetchWeeklyTimetable, weekNumber]);

  useLoadErrorAlert({
    subject: "ton emploi du temps",
    error,
    failures,
    hasData: timetable.length > 0,
  });

  return {
    timetable,
    refresh,
    manualRefreshing,
    handleRefresh,
    isLoading,
    error,
    failures,
  };
}
