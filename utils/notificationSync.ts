import { getWeekNumberFromDate } from "@/database/useHomework";
import { AccountManager, getManager, type AccountManager as AccountManagerType } from "@/services/shared";
import { Capabilities } from "@/services/shared/types";
import { CourseStatus, CourseType } from "@/services/shared/timetable";
import type { Course } from "@/services/shared/timetable";
import type { Grade, Period } from "@/services/shared/grade";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import type { NotificationPreferences } from "@/stores/settings/types";
import { warn } from "@/utils/logger/logger";
import { isTauriDesktop } from "@/utils/network/fetch";
import {
  getNextNotificationTime,
  scheduleSystemNotification,
  showSystemNotification,
  cancelSystemNotification,
  type SystemNotification,
} from "@/utils/notifications";
import {
  getNewNotificationKeys,
  isNotificationCategoryConfiguredEnabled,
  isNotificationCategoryEnabled,
  type NotificationCategory,
} from "@/utils/notificationPreferences";

export const BACKGROUND_SYNC_INTERVAL_MS = 30 * 60 * 1000;
const MAX_REMINDER_LEAD_MINUTES = 180;

function validDate(value: unknown): Date | null {
  const date = value instanceof Date ? new Date(value) : new Date(value as string | number);
  return Number.isFinite(date.getTime()) ? date : null;
}

function sameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function contentHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function normalizedPreferences(): NotificationPreferences | undefined {
  return useSettingsStore.getState().personalization.notificationPreferences;
}

function getSeenKeys(storageKey: string): string[] | undefined {
  return useSettingsStore.getState().personalization.notificationSeenServiceItemKeys?.[storageKey];
}

function saveSeenKeys(storageKey: string, keys: string[]): void {
  const current = useSettingsStore.getState().personalization.notificationSeenServiceItemKeys ?? {};
  useSettingsStore.getState().mutateProperty("personalization", {
    notificationSeenServiceItemKeys: { ...current, [storageKey]: keys },
  });
}

function recordItems(
  serviceId: string,
  category: NotificationCategory,
  itemKeys: string[],
): string[] {
  const storageKey = `${serviceId}:${category}`;
  const previous = getSeenKeys(storageKey);
  const prefixedKeys = itemKeys.map(key => `${category}:${key}`);
  const result = getNewNotificationKeys(previous, prefixedKeys);
  saveSeenKeys(storageKey, result.allKeys);
  return result.newKeys.map(key => key.slice(category.length + 1));
}

function isServiceCategoryEnabled(
  preferences: NotificationPreferences | undefined,
  category: NotificationCategory,
  serviceId: string,
  now: number,
): boolean {
  return isNotificationCategoryEnabled(preferences, category, serviceId, now);
}

function createCourseReminder(course: Course, serviceId: string, leadMinutes: number, now: Date): SystemNotification | null {
  const start = validDate(course.from);
  if (!start || course.status === CourseStatus.CANCELED || course.type === CourseType.VACATION) return null;

  const reminderAt = new Date(start.getTime() - leadMinutes * 60 * 1000);
  if (reminderAt.getTime() <= now.getTime()) return null;

  const details = [course.room, course.teacher].filter(Boolean).join(" · ");
  return {
    id: `course-reminder:${serviceId}:${course.id}:${start.getTime()}`,
    serviceId,
    title: `Cours dans ${leadMinutes} min · ${course.subject || "Emploi du temps"}`,
    body: details || "Ouvre Papillon pour consulter ton emploi du temps.",
    at: reminderAt,
  };
}

async function reconcileCourseReminders(
  serviceId: string,
  courses: Course[],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  const rawLead = preferences?.courseLeadMinutes ?? 15;
  const leadMinutes = Math.max(1, Math.min(MAX_REMINDER_LEAD_MINUTES, Math.round(rawLead)));
  const active = new Map<string, SystemNotification>();
  if (isNotificationCategoryConfiguredEnabled(preferences, "courses", serviceId)) {
    for (const course of courses) {
      const reminder = createCourseReminder(course, serviceId, leadMinutes, now);
      if (reminder?.at) active.set(reminder.id, reminder);
    }
  }

  const pending = useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [];
  for (const item of pending) {
    if (!item.id.startsWith(`course-reminder:${serviceId}:`) || active.has(item.id)) continue;
    await cancelSystemNotification(item.id);
  }

  const currentPending = useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [];
  for (const reminder of active.values()) {
    const at = reminder.at!.toISOString();
    const existing = currentPending.find(item => item.id === reminder.id);
    if (existing?.at === at && existing.title === reminder.title && existing.body === reminder.body) continue;
    await scheduleSystemNotification("courses", reminder);
  }
}

async function syncCourses(
  serviceId: string,
  client: ReturnType<AccountManagerType["getServiceClients"]>[number]["plugin"],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  if (!client.getWeeklyTimetable) return;
  const week = getWeekNumberFromDate(now);
  const nextWeekDate = addDays(now, 7);
  const nextWeek = getWeekNumberFromDate(nextWeekDate);
  const targets = [...new Map([[week, now], [nextWeek, nextWeekDate]]).entries()];
  const courseDays = await Promise.all(targets.map(([number, date]) => client.getWeeklyTimetable!(number, date)));
  if (!courseDays.every(Array.isArray)) throw new TypeError("Le service n'a pas renvoyé une liste d'emplois du temps.");

  const courses = courseDays.flatMap(days => days.flatMap(day => Array.isArray(day?.courses) ? day.courses : []));
  await reconcileCourseReminders(serviceId, courses, preferences, now);
}

async function syncHomeworks(
  serviceId: string,
  client: ReturnType<AccountManagerType["getServiceClients"]>[number]["plugin"],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  if (!client.getHomeworks) return;
  const tomorrow = addDays(now, 1);
  const week = getWeekNumberFromDate(tomorrow);
  const homeworks = await client.getHomeworks(week);
  if (!Array.isArray(homeworks)) throw new TypeError("Le service n'a pas renvoyé une liste de devoirs.");

  const dueTomorrow = homeworks.filter(homework => {
    const dueDate = validDate(homework?.dueDate);
    return dueDate && !homework.isDone && sameLocalDay(dueDate, tomorrow);
  });
  const id = `homework-tomorrow:${serviceId}:${localDateKey(tomorrow)}`;
  if (dueTomorrow.length === 0 || !isNotificationCategoryConfiguredEnabled(preferences, "homework", serviceId)) {
    await cancelSystemNotification(id);
    return;
  }

  const dailyTime = preferences?.dailyTime ?? "18:00";
  const at = getNextNotificationTime(dailyTime, 0, now);
  if (at.getTime() <= now.getTime()) {
    await cancelSystemNotification(id);
    return;
  }

  const subjects = [...new Set(dueTomorrow.map(homework => homework.subject).filter(Boolean))].slice(0, 3);
  const body = subjects.length > 0
    ? subjects.join(", ")
    : `${dueTomorrow.length} devoir${dueTomorrow.length > 1 ? "s" : ""} à rendre demain.`;
  const notification: SystemNotification = {
    id,
    serviceId,
    title: dueTomorrow.length === 1 ? "Devoir à rendre demain" : `${dueTomorrow.length} devoirs à rendre demain`,
    body,
    at,
  };
  const existing = (useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [])
    .find(item => item.id === id);
  if (existing?.at === at.toISOString() && existing.title === notification.title && existing.body === body) return;
  await scheduleSystemNotification("homework", notification);
}

async function syncNews(
  serviceId: string,
  client: ReturnType<AccountManagerType["getServiceClients"]>[number]["plugin"],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  if (!client.getNews) return;
  const news = await client.getNews();
  if (!Array.isArray(news)) throw new TypeError("Le service n'a pas renvoyé une liste d'actualités.");

  const keyedNews = news.filter(item => item && item.id).map(item => ({ item, key: String(item.id) }));
  const newKeys = recordItems(serviceId, "news", keyedNews.map(({ key }) => key));
  if (!newKeys.length || !isServiceCategoryEnabled(preferences, "news", serviceId, now.getTime())) return;

  const newest = keyedNews
    .filter(({ key }) => newKeys.includes(key))
    .sort((left, right) => (validDate(right.item.createdAt)?.getTime() ?? 0) - (validDate(left.item.createdAt)?.getTime() ?? 0))[0]?.item;
  const title = newest?.title?.trim() || "Nouvelle actualité";
  const body = newKeys.length > 1
    ? `${newKeys.length} nouvelles actualités sont disponibles.`
    : (newest?.author ? `Par ${newest.author}` : "Une nouvelle actualité est disponible.");
  await showSystemNotification("news", {
    id: `background-news:${serviceId}:${contentHash(newKeys.join("|"))}`,
    serviceId,
    title,
    body,
  });
}

function selectRelevantPeriods(periods: Period[], now: Date): Period[] {
  const valid = periods.filter(period => period && validDate(period.start) && validDate(period.end));
  if (valid.length === 0) return [];

  const active = valid.filter(period => {
    const start = validDate(period.start)!;
    const end = validDate(period.end)!;
    return start.getTime() <= now.getTime() && end.getTime() >= now.getTime();
  });
  if (active.length > 0) return active;

  const upcoming = valid.filter(period => validDate(period.end)!.getTime() >= now.getTime())
    .sort((left, right) => validDate(left.start)!.getTime() - validDate(right.start)!.getTime());
  if (upcoming.length > 0) return [upcoming[0]];
  return [valid.sort((left, right) => validDate(right.end)!.getTime() - validDate(left.end)!.getTime())[0]];
}

async function syncGrades(
  serviceId: string,
  client: ReturnType<AccountManager["getServiceClients"]>[number]["plugin"],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  if (!client.getGradesPeriods || !client.getGradesForPeriod) return;
  const periods = await client.getGradesPeriods();
  if (!Array.isArray(periods)) throw new TypeError("Le service n'a pas renvoyé une liste de périodes.");

  const relevantPeriods = selectRelevantPeriods(periods, now);
  const periodResults = await Promise.all(relevantPeriods.map(period => client.getGradesForPeriod!(period)));
  const grades: Array<{ grade: Grade; key: string }> = periodResults.flatMap((periodResult, index) => {
    const period = relevantPeriods[index];
    const subjects = Array.isArray(periodResult?.subjects) ? periodResult.subjects : [];
    return subjects.flatMap(subject =>
      (Array.isArray(subject.grades) ? subject.grades : []).filter(grade => grade && grade.id).map(grade => ({
        grade,
        key: `${period.id ?? period.name}:${subject.id}:${grade.id}`,
      }))
    );
  });

  const newKeys = recordItems(serviceId, "grades", grades.map(({ key }) => key));
  if (!newKeys.length || !isServiceCategoryEnabled(preferences, "grades", serviceId, now.getTime())) return;

  const addedGrades = grades.filter(({ key }) => newKeys.includes(key));
  const subjects = [...new Set(addedGrades.map(({ grade }) => grade.subjectName).filter(Boolean))].slice(0, 3);
  await showSystemNotification("grades", {
    id: `background-grades:${serviceId}:${contentHash(newKeys.join("|"))}`,
    serviceId,
    title: newKeys.length === 1 ? "Nouvelle note" : `${newKeys.length} nouvelles notes`,
    body: subjects.join(", ") || "De nouvelles notes ont été ajoutées.",
  });
}

async function syncService(
  entry: ReturnType<AccountManagerType["getServiceClients"]>[number],
  preferences: NotificationPreferences | undefined,
  now: Date,
): Promise<void> {
  const tasks: Array<[Capabilities, () => Promise<void>]> = [
    [Capabilities.TIMETABLE, () => syncCourses(entry.id, entry.plugin, preferences, now)],
    [Capabilities.HOMEWORK, () => syncHomeworks(entry.id, entry.plugin, preferences, now)],
    [Capabilities.NEWS, () => syncNews(entry.id, entry.plugin, preferences, now)],
    [Capabilities.GRADES, () => syncGrades(entry.id, entry.plugin, preferences, now)],
  ];

  for (const [capability, run] of tasks) {
    if (!entry.capabilities.includes(capability)) continue;
    try {
      await run();
    } catch (error) {
      warn(`Background ${Capabilities[capability]} sync failed for ${entry.displayName}: ${String(error)}`, "notificationSync");
    }
  }
}

export async function runBackgroundNotificationSync(now = new Date()): Promise<void> {
  if (!isTauriDesktop()) return;
  const preferences = normalizedPreferences();
  if (!preferences?.enabled) return;

  const state = useAccountStore.getState();
  if (state.accounts.length === 0) {
    await syncCustomHomeworkReminders(now, preferences);
    return;
  }

  const currentManager = getManager(true);
  for (const connectedAccount of state.accounts.filter(candidate => candidate.services.length > 0)) {
    const manager = currentManager?.getAccount().id === connectedAccount.id
      ? currentManager
      : new AccountManager(connectedAccount);
    try {
      await manager.refreshAllAccounts();
    } catch (error) {
      // Successful services remain available if another service on the account failed.
      warn(`Some services could not refresh for account ${connectedAccount.id}: ${String(error)}`, "notificationSync");
    }
    await Promise.all(manager.getServiceClients().map(entry => syncService(entry, preferences, now)));
  }
  await syncCustomHomeworkReminders(now, preferences);
}

async function syncCustomHomeworkReminders(
  now: Date,
  preferences: NotificationPreferences | undefined,
): Promise<void> {
  const customHomeworks = useSettingsStore.getState().personalization.customHomeworks ?? [];
  const activeIds = new Set<string>();
  for (const homework of customHomeworks) {
    if (homework.isDone || !homework.reminderAt) continue;
    const at = validDate(homework.reminderAt);
    if (!at || at.getTime() <= now.getTime()) continue;
    const id = `custom-homework-${homework.id}`;
    activeIds.add(id);
    const pending = (useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [])
      .find(item => item.id === id);
    if (pending?.at === at.toISOString()) continue;
    await scheduleSystemNotification("homework", {
      id,
      title: "Rappel de devoir",
      body: homework.subject || homework.content,
      at,
    });
  }

  const pending = useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [];
  for (const item of pending) {
    if (item.id.startsWith("custom-homework-") && !activeIds.has(item.id)) {
      await cancelSystemNotification(item.id);
    }
  }
}

export function startBackgroundNotificationSync(): () => void {
  if (!isTauriDesktop()) return () => undefined;

  let disposed = false;
  let interval: ReturnType<typeof setInterval> | null = null;
  let inFlight: Promise<void> | null = null;
  let rerunRequested = false;
  let lastPreferences = normalizedPreferences();
  let lastAccountId = useAccountStore.getState().lastUsedAccount;
  let lastAccounts = useAccountStore.getState().accounts;

  const sync = () => {
    if (disposed) return;
    if (inFlight) {
      rerunRequested = true;
      return;
    }
    inFlight = runBackgroundNotificationSync().catch(error => {
      warn(`Background notification sync failed: ${String(error)}`, "notificationSync");
    }).finally(() => {
      inFlight = null;
      if (rerunRequested && !disposed) {
        rerunRequested = false;
        sync();
      }
    });
  };

  interval = setInterval(sync, BACKGROUND_SYNC_INTERVAL_MS);
  const unsubscribeSettings = useSettingsStore.subscribe(state => {
    const next = state.personalization.notificationPreferences;
    if (next === lastPreferences) return;
    lastPreferences = next;
    sync();
  });
  const unsubscribeAccounts = useAccountStore.subscribe(state => {
    if (state.lastUsedAccount === lastAccountId && state.accounts === lastAccounts) return;
    lastAccountId = state.lastUsedAccount;
    lastAccounts = state.accounts;
    sync();
  });

  sync();
  return () => {
    disposed = true;
    if (interval) clearInterval(interval);
    unsubscribeSettings();
    unsubscribeAccounts();
  };
}
