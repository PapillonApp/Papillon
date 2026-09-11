import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAccountStore } from "@/stores/account";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { useHomeworkForWeeks, updateHomeworkIsDone } from "@/database/useHomework";
import { generateId } from "@/utils/generateId";
import { error } from '@/utils/logger/logger';
import { trackAdvancedEvent } from '@/utils/logger/analytics';
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";

// Cache reads are coalesced over this window: fetching five weeks would
// otherwise re-query every one of them five times over.
const REFRESH_COALESCE_MS = 120;

const homeworkKey = (homework: Homework) =>
  generateId(
    homework.subject +
    homework.content +
    homework.createdByAccount +
    new Date(homework.dueDate).toDateString()
  );

// Every cache read rebuilds its objects from the database, so identity alone
// says nothing about whether anything changed. Comparing the fields that reach
// the UI lets the previous object be kept, which is what stops one week's
// refresh from re-rendering every mounted page.
const isSameHomework = (a: Homework, b: Homework) =>
  a.id === b.id &&
  a.isDone === b.isDone &&
  a.subject === b.subject &&
  a.content === b.content &&
  a.custom === b.custom &&
  a.evaluation === b.evaluation &&
  a.returnFormat === b.returnFormat &&
  a.fromCache === b.fromCache &&
  a.attachments.length === b.attachments.length &&
  new Date(a.dueDate).getTime() === new Date(b.dueDate).getTime();

const isSameList = (a: Homework[], b: Homework[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

/**
 * Loads every week the pager may show, not just the one on screen: the weeks
 * are passed in most-wanted first, and each one is fetched independently so a
 * slow neighbour never holds back the visible week. Weeks come back already
 * merged with the freshly fetched homework, as arrays whose identity only
 * changes when that week's contents actually did.
 */
export const useHomeworkData = (weeks: number[], alert: any) => {
  const [refreshingWeek, setRefreshingWeek] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const store = useAccountStore.getState();
  const account = store.accounts.find(acc => acc.id === store.lastUsedAccount);
  type Service = { id: string };
  const services = useMemo(() => account?.services?.map((s: Service) => s.id) ?? [], [account]);
  const [manager, setManager] = useState(() => getManager(true));

  const cacheByWeek = useHomeworkForWeeks(weeks, refreshTrigger);

  const itemCache = useRef<Map<string, Homework>>(new Map());
  const weekCache = useRef<Record<number, Homework[]>>({});

  const homeworkByWeek = useMemo(() => {
    const previousItems = itemCache.current;
    const nextItems = new Map<string, Homework>();
    const previousWeeks = weekCache.current;
    const nextWeeks: Record<number, Homework[]> = {};

    for (const [key, list] of Object.entries(cacheByWeek)) {
      const week = Number(key);
      const items = list
        .filter(h => services.includes(h.createdByAccount))
        .map(cached => {
          const merged = (cached.id ? homework[cached.id] : undefined) ?? cached;
          const id = merged.id ?? homeworkKey(merged);
          const previous = previousItems.get(id);
          const item = previous && isSameHomework(previous, merged) ? previous : merged;
          nextItems.set(id, item);
          return item;
        });

      const previous = previousWeeks[week];
      nextWeeks[week] = previous && isSameList(previous, items) ? previous : items;
    }

    itemCache.current = nextItems;
    weekCache.current = nextWeeks;
    return nextWeeks;
  }, [cacheByWeek, homework, services]);

  // A week is fetched from the service once per session; `inFlightWeeks` keeps a
  // swipe back and forth from queueing the same request twice.
  const fetchedWeeks = useRef<Set<number>>(new Set());
  const inFlightWeeks = useRef<Set<number>>(new Set());
  const weeksRef = useRef(weeks);
  weeksRef.current = weeks;

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) {
      return;
    }
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      setRefreshTrigger(p => p + 1);
    }, REFRESH_COALESCE_MS);
  }, []);

  useEffect(() => () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
  }, []);

  const fetchWeek = useCallback(
    async (week: number, managerToUse = manager, force = false) => {
      if (!managerToUse) { return; }
      if (inFlightWeeks.current.has(week)) { return; }
      if (!force && fetchedWeeks.current.has(week)) { return; }

      inFlightWeeks.current.add(week);
      try {
        const result: Homework[] = await managerToUse.getHomeworks(week);
        const fetched: Record<string, Homework> = {};
        for (const hw of result) {
          const id = homeworkKey(hw);
          fetched[id] = { ...hw, id: hw.id ?? id };
        }
        fetchedWeeks.current.add(week);
        setHomework(prev => ({ ...prev, ...fetched }));
        scheduleRefresh();
      } catch (e) {
        error("Fetch error", String(e));
      } finally {
        inFlightWeeks.current.delete(week);
      }
    },
    [manager, scheduleRefresh]
  );

  const weeksKey = weeks.join(",");
  useEffect(() => {
    for (const week of weeksRef.current) {
      fetchWeek(week);
    }
  }, [weeksKey, fetchWeek]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      setManager(updatedManager);
      fetchedWeeks.current.clear();
      for (const week of weeksRef.current) {
        fetchWeek(week, updatedManager, true);
      }
    });
    return () => unsubscribe();
  }, [fetchWeek]);

  const handleRefresh = useCallback(
    async (week: number) => {
      setRefreshingWeek(week);
      try {
        await fetchWeek(week, manager, true);
      } finally {
        setRefreshingWeek(null);
      }
    },
    [fetchWeek, manager]
  );

  const setAsDone = useCallback(
    async (item: Homework, done: boolean) => {
      const id = homeworkKey(item);

      try {
        const manager = getManager();
        await manager.setHomeworkCompletion(item, done)

        updateHomeworkIsDone(id, done);

        // The optimistic entry is what flips the checkbox: the database write
        // and its cache read land a moment later.
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] ?? item),
            isDone: done,
          }
        }));
        scheduleRefresh();
        if (done) {
          notificationAsync(NotificationFeedbackType.Success);
        }
        trackAdvancedEvent(done ? "task_ticked" : "task_unticked");
      }
      catch (err) {
        alert.showAlert({
            title: "Une erreur est survenue",
            message: "Ce devoir n'a pas été mis à jour",
            description:
              "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de te rendre sur l'application officielle de ton établissement afin de définir son état.",
            color: "#D60046",
            icon: "AlertTriangle",
            technical: String(err)
          });

        updateHomeworkIsDone(id, !done);
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] ?? item),
            isDone: !done,
          }
        }));
        scheduleRefresh();
      }
    },
    [scheduleRefresh]
  );

  return {
    homeworkByWeek,
    refreshingWeek,
    handleRefresh,
    setAsDone,
  };
};
