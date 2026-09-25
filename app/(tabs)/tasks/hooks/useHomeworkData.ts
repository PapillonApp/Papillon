import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAccountStore } from "@/stores/account";
import type { AccountManager } from "@/services/shared";
import { getManager } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { getDateRangeOfWeek, useHomeworkForWeeks, updateHomeworkIsDone } from "@/database/useHomework";
import { useLoadErrorAlert } from "@/hooks/useLoadErrorAlert";
import { useManagerSubscription } from "@/hooks/useManagerSubscription";
import { Capabilities, ServiceFailure } from "@/services/shared/types";
import { generateId } from "@/utils/generateId";
import { error } from '@/utils/logger/logger';
import { trackAdvancedEvent } from '@/utils/logger/analytics';
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";
import { useSettingsStore } from "@/stores/settings";
import { cancelSystemNotification, getNextNotificationTime, scheduleSystemNotification } from "@/utils/notifications";
import { isTauriDesktop } from "@/utils/network/fetch";

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
  a.reminderAt?.getTime() === b.reminderAt?.getTime() &&
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

  // Read through selectors: switching accounts has to rebuild `services`, or the
  // filter below would keep matching the previous account and hide every task.
  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const storedCustomHomeworks = useSettingsStore(state => state.personalization.customHomeworks);
  const customHomeworks = useMemo(() => storedCustomHomeworks ?? [], [storedCustomHomeworks]);
  const notificationPreferences = useSettingsStore(state => state.personalization.notificationPreferences);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);
  const account = accounts.find(acc => acc.id === lastUsedAccount);
  type Service = { id: string };
  const services = useMemo(() => account?.services?.map((s: Service) => s.id) ?? [], [account]);
  const [manager, setManager] = useState(() => getManager(true));
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [failures, setFailures] = useState<ServiceFailure[]>([]);

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
      const { start, end } = getDateRangeOfWeek(week);
      const customForWeek: Homework[] = customHomeworks.flatMap(stored => {
        const dueDate = new Date(stored.dueDate);
        if (!Number.isFinite(dueDate.getTime()) || dueDate < start || dueDate > end) return [];
        const reminderAt = stored.reminderAt ? new Date(stored.reminderAt) : undefined;
        return [{
          id: stored.id,
          subject: stored.subject,
          content: stored.content,
          dueDate,
          isDone: stored.isDone,
          attachments: [],
          evaluation: false,
          custom: true,
          createdByAccount: stored.createdByAccount,
          reminderAt: reminderAt && Number.isFinite(reminderAt.getTime()) ? reminderAt : undefined,
        }];
      });

      const items = [...list, ...customForWeek]
        .filter(h => h.custom || services.includes(h.createdByAccount))
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
  }, [cacheByWeek, homework, services, customHomeworks]);

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
        // The manager falls back to the cache rather than throwing, so a service
        // that failed is only visible through its recorded failures.
        setFailures(managerToUse.getFailures(Capabilities.HOMEWORK));
        setLoadError(null);
      } catch (e) {
        error("Fetch error", String(e));
        setFailures(managerToUse.getFailures(Capabilities.HOMEWORK));
        setLoadError(e instanceof Error ? e : new Error(String(e)));
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

  const managerRef = useRef(manager);
  const handleManager = useCallback((updatedManager: AccountManager) => {
    // The subscription is re-established whenever `fetchWeek` changes, and fires
    // straight away with the manager already in hand: only an actually new
    // manager is worth re-fetching every week for.
    if (managerRef.current === updatedManager) { return; }
    managerRef.current = updatedManager;
    setManager(updatedManager);
    fetchedWeeks.current.clear();
    setLoadError(null);
    for (const week of weeksRef.current) {
      fetchWeek(week, updatedManager, true);
    }
  }, [fetchWeek]);

  // Without a manager nothing is ever fetched: say so rather than leaving the
  // week looking like it simply has no homework.
  const handleManagerUnavailable = useCallback(() => {
    setRefreshingWeek(null);
    setLoadError(new Error("Account manager unavailable"));
  }, []);

  useManagerSubscription(handleManager, handleManagerUnavailable);

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
        if (item.custom) {
          const current = useSettingsStore.getState().personalization.customHomeworks ?? [];
          mutateSettings("personalization", {
            customHomeworks: current.map(homework => homework.id === item.id ? { ...homework, isDone: done } : homework),
          });
          if (done || !item.reminderAt) {
            await cancelSystemNotification(`custom-homework-${item.id}`);
          } else {
            await scheduleSystemNotification("homework", {
              id: `custom-homework-${item.id}`,
              title: `Rappel : ${item.subject}`,
              body: item.content.replace(/<[^>]*>/g, "").slice(0, 180),
              at: item.reminderAt,
            });
          }
          if (done) notificationAsync(NotificationFeedbackType.Success);
          trackAdvancedEvent(done ? "task_ticked" : "task_unticked");
          return;
        }

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
    [alert, mutateSettings, scheduleRefresh]
  );

  const tomorrowHomework = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const seen = new Set<string>();

    return Object.values(homeworkByWeek)
      .flat()
      .filter(item => {
        const id = item.id ?? homeworkKey(item);
        const dueDate = new Date(item.dueDate);
        if (seen.has(id) || item.isDone || (item.custom && item.reminderAt)) return false;
        seen.add(id);
        return dueDate >= start && dueDate < end;
      });
  }, [homeworkByWeek]);

  useEffect(() => {
    if (isTauriDesktop()) return;
    const activeIds = new Set<string>();
    if (notificationPreferences?.enabled && notificationPreferences.homework) {
      for (const item of customHomeworks) {
        if (item.isDone || !item.reminderAt) continue;
        const reminderAt = new Date(item.reminderAt);
        if (!Number.isFinite(reminderAt.getTime())) continue;
        const id = `custom-homework-${item.id}`;
        activeIds.add(id);
        void scheduleSystemNotification("homework", {
          id,
          title: `Rappel : ${item.subject}`,
          body: item.content.replace(/<[^>]*>/g, "").slice(0, 180),
          at: reminderAt,
        });
      }
    }
    for (const item of customHomeworks) {
      const id = `custom-homework-${item.id}`;
      if (!activeIds.has(id)) void cancelSystemNotification(id);
    }
  }, [customHomeworks, notificationPreferences?.enabled, notificationPreferences?.homework]);

  useEffect(() => {
    if (isTauriDesktop()) return;
    const id = "homework-tomorrow";
    if (!notificationPreferences?.enabled || !notificationPreferences.homework || tomorrowHomework.length === 0) {
      void cancelSystemNotification(id);
      return;
    }

    const subjects = Array.from(new Set(tomorrowHomework.map(item => item.subject))).slice(0, 3).join(", ");
    const extraCount = Math.max(0, tomorrowHomework.length - 3);
    void scheduleSystemNotification("homework", {
      id,
      title: "Devoirs pour demain",
      body: `${tomorrowHomework.length} devoir${tomorrowHomework.length > 1 ? "s" : ""}${subjects ? ` : ${subjects}` : ""}${extraCount ? ` et ${extraCount} autre${extraCount > 1 ? "s" : ""}` : ""}`,
      at: getNextNotificationTime(notificationPreferences.dailyTime || "18:00", 0),
    });
  }, [tomorrowHomework, notificationPreferences?.enabled, notificationPreferences?.homework, notificationPreferences?.dailyTime]);

  const hasData = Object.values(homeworkByWeek).some(list => list.length > 0);
  useLoadErrorAlert({
    subject: "tes devoirs",
    error: loadError,
    failures,
    hasData,
  });

  return {
    homeworkByWeek,
    refreshingWeek,
    handleRefresh,
    setAsDone,
    error: loadError,
    failures,
  };
};
