import { Platform } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import type { PendingSystemNotification } from "@/stores/settings/types";
import { isTauriDesktop } from "@/utils/network/fetch";

export type NotificationCategory = "courses" | "homework" | "grades" | "news";

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  at?: Date;
}

const browserTimers = new Map<string, ReturnType<typeof setTimeout>>();
const browserTimerCategories = new Map<string, NotificationCategory>();
const tauriTimers = new Map<string, ReturnType<typeof setTimeout>>();
let expoNotificationsPromise: Promise<typeof import("expo-notifications")> | null = null;
const MAX_TIMEOUT = 2_147_000_000;

async function getExpoNotifications() {
  expoNotificationsPromise ??= import("expo-notifications").then(notifications => {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    return notifications;
  });
  return expoNotificationsPromise;
}

function notificationId(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (Math.abs(hash) % 2_000_000_000) + 1;
}

export async function requestSystemNotificationPermission(): Promise<boolean> {
  try {
    if (isTauriDesktop()) {
      const notifications = await import("@tauri-apps/plugin-notification");
      if (await notifications.isPermissionGranted()) return true;
      return (await notifications.requestPermission()) === "granted";
    }

    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !("Notification" in window)) return false;
      if (window.Notification.permission === "granted") return true;
      return (await window.Notification.requestPermission()) === "granted";
    }

    const notifications = await getExpoNotifications();
    const current = await notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL) return true;
    const requested = await notifications.requestPermissionsAsync();
    return requested.granted || requested.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

async function hasSystemNotificationPermission(): Promise<boolean> {
  try {
    if (isTauriDesktop()) {
      const notifications = await import("@tauri-apps/plugin-notification");
      return notifications.isPermissionGranted();
    }

    if (Platform.OS === "web") {
      return typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted";
    }

    const notifications = await getExpoNotifications();
    const permissions = await notifications.getPermissionsAsync();
    return permissions.granted || permissions.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

function categoryEnabled(category: NotificationCategory): boolean {
  const preferences = useSettingsStore.getState().personalization.notificationPreferences;
  return Boolean(preferences?.enabled && preferences[category]);
}

function updatePendingSchedules(update: (pending: PendingSystemNotification[]) => PendingSystemNotification[]) {
  const personalization = useSettingsStore.getState().personalization;
  const pending = personalization.pendingNotificationSchedules ?? [];
  useSettingsStore.getState().mutateProperty("personalization", {
    pendingNotificationSchedules: update(pending),
  });
}

function removePendingSchedule(id: string) {
  updatePendingSchedules(pending => pending.filter(item => item.id !== id));
}

function scheduleTauriTimer(pending: PendingSystemNotification) {
  const existing = tauriTimers.get(pending.id);
  if (existing) clearTimeout(existing);
  tauriTimers.delete(pending.id);

  if (!categoryEnabled(pending.category)) {
    removePendingSchedule(pending.id);
    return;
  }

  const at = new Date(pending.at).getTime();
  if (!Number.isFinite(at) || at <= Date.now()) {
    removePendingSchedule(pending.id);
    return;
  }

  const timer = setTimeout(() => {
    tauriTimers.delete(pending.id);
    const remaining = at - Date.now();
    if (remaining > 0) {
      scheduleTauriTimer(pending);
      return;
    }
    removePendingSchedule(pending.id);
    void showSystemNotification(pending.category, {
      id: pending.id,
      title: pending.title,
      body: pending.body,
    });
  }, Math.min(at - Date.now(), MAX_TIMEOUT));
  tauriTimers.set(pending.id, timer);
}

export function initializePendingSystemNotifications(): void {
  if (!isTauriDesktop()) return;
  const pending = useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [];
  for (const notification of pending) scheduleTauriTimer(notification);
}

export async function cancelSystemNotifications(category?: NotificationCategory): Promise<void> {
  const pending = useSettingsStore.getState().personalization.pendingNotificationSchedules ?? [];
  const canceled = pending.filter(item => category === undefined || item.category === category);
  for (const item of canceled) {
    const timer = tauriTimers.get(item.id);
    if (timer) clearTimeout(timer);
    tauriTimers.delete(item.id);
    const browserTimer = browserTimers.get(item.id);
    if (browserTimer) clearTimeout(browserTimer);
    browserTimers.delete(item.id);
    browserTimerCategories.delete(item.id);
  }
  for (const [id, timerCategory] of browserTimerCategories) {
    if (category !== undefined && timerCategory !== category) continue;
    const timer = browserTimers.get(id);
    if (timer) clearTimeout(timer);
    browserTimers.delete(id);
    browserTimerCategories.delete(id);
  }
  if (canceled.length) {
    const canceledIds = new Set(canceled.map(item => item.id));
    updatePendingSchedules(items => items.filter(item => !canceledIds.has(item.id)));
  }

  try {
    if (isTauriDesktop() && canceled.length) {
      const notifications = await import("@tauri-apps/plugin-notification");
      await notifications.cancel(canceled.map(item => notificationId(item.id)));
    } else if (Platform.OS !== "web") {
      const notifications = await getExpoNotifications();
      if (category === undefined) {
        await notifications.cancelAllScheduledNotificationsAsync();
      } else {
        const scheduled = await notifications.getAllScheduledNotificationsAsync();
        const matching = scheduled.filter(item => item.content.data?.category === category);
        await Promise.all(matching.map(item => notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => undefined)));
      }
    }
  } catch {
    // A notification may already have fired or been removed by the operating system.
  }
}

export async function showSystemNotification(
  category: NotificationCategory,
  notification: SystemNotification
): Promise<void> {
  if (!categoryEnabled(category) || !(await hasSystemNotificationPermission())) return;

  try {
    if (isTauriDesktop()) {
      const notifications = await import("@tauri-apps/plugin-notification");
      notifications.sendNotification({
        id: notificationId(notification.id),
        title: notification.title,
        body: notification.body,
      });
      return;
    }

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && "Notification" in window) {
        new window.Notification(notification.title, { body: notification.body, tag: notification.id });
      }
      return;
    }

    const notifications = await getExpoNotifications();
    await notifications.scheduleNotificationAsync({
      content: { title: notification.title, body: notification.body, data: { category } },
      trigger: null,
    });
  } catch {
    // OS notification permissions and platform services can change while the app is open.
  }
}

export async function cancelSystemNotification(id: string): Promise<void> {
  const timer = browserTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    browserTimers.delete(id);
  }
  browserTimerCategories.delete(id);
  const tauriTimer = tauriTimers.get(id);
  if (tauriTimer) {
    clearTimeout(tauriTimer);
    tauriTimers.delete(id);
  }
  removePendingSchedule(id);

  try {
    if (isTauriDesktop()) {
      const notifications = await import("@tauri-apps/plugin-notification");
      await notifications.cancel([notificationId(id)]);
    } else if (Platform.OS !== "web") {
      const notifications = await getExpoNotifications();
      await notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    }
  } catch {
    // A notification may already have fired or been removed by the operating system.
  }
}

export async function scheduleSystemNotification(
  category: NotificationCategory,
  notification: SystemNotification
): Promise<void> {
  await cancelSystemNotification(notification.id);
  if (!notification.at || notification.at.getTime() <= Date.now() || !categoryEnabled(category)) return;
  if (!(await hasSystemNotificationPermission())) return;

  try {
    if (isTauriDesktop()) {
      const pending: PendingSystemNotification = {
        id: notification.id,
        category,
        title: notification.title,
        body: notification.body,
        at: notification.at.toISOString(),
      };
      updatePendingSchedules(items => [...items.filter(item => item.id !== pending.id), pending]);
      scheduleTauriTimer(pending);
      return;
    }

    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      const delay = notification.at.getTime() - Date.now();
      const timer = setTimeout(() => {
        if (window.Notification.permission === "granted") {
          new window.Notification(notification.title, { body: notification.body, tag: notification.id });
        }
        browserTimers.delete(notification.id);
        browserTimerCategories.delete(notification.id);
      }, delay);
      browserTimers.set(notification.id, timer);
      browserTimerCategories.set(notification.id, category);
      return;
    }

    const notifications = await getExpoNotifications();
    await notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: { title: notification.title, body: notification.body, data: { category } },
      trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date: notification.at },
    });
  } catch {
    // Keep the feature optional when a platform doesn't support local scheduling.
  }
}

export function getNextNotificationTime(time: string, daysAhead: number): Date {
  const [hours = "19", minutes = "00"] = time.split(":");
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date;
}
