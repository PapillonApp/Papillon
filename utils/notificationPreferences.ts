import type {
  NotificationCategories,
  NotificationPreferences,
} from "@/stores/settings/types";

export type NotificationCategory = keyof NotificationCategories;

export function isNotificationPaused(
  preferences: NotificationPreferences | undefined,
  now = Date.now(),
): boolean {
  if (!preferences) return false;
  if (preferences.pauseIndefinitely) return true;

  if (!preferences.pauseUntil) return false;
  const resumeAt = new Date(preferences.pauseUntil).getTime();
  return Number.isFinite(resumeAt) && resumeAt > now;
}

export function isNotificationCategoryEnabled(
  preferences: NotificationPreferences | undefined,
  category: NotificationCategory,
  serviceId?: string,
  now = Date.now(),
): boolean {
  return isNotificationCategoryConfiguredEnabled(preferences, category, serviceId)
    && !isNotificationPaused(preferences, now);
}

export function isNotificationCategoryConfiguredEnabled(
  preferences: NotificationPreferences | undefined,
  category: NotificationCategory,
  serviceId?: string,
): boolean {
  if (!preferences?.enabled || !preferences[category]) return false;
  if (!serviceId) return true;
  return preferences.serviceOverrides?.[serviceId]?.[category] ?? true;
}

export function getNewNotificationKeys(
  previousKeys: string[] | undefined,
  incomingKeys: string[],
): { isFirstSync: boolean; newKeys: string[]; allKeys: string[] } {
  const known = new Set(previousKeys ?? []);
  const uniqueIncoming = [...new Set(incomingKeys)];
  const isFirstSync = previousKeys === undefined;

  return {
    isFirstSync,
    newKeys: isFirstSync ? [] : uniqueIncoming.filter(key => !known.has(key)),
    allKeys: [...new Set([...(previousKeys ?? []), ...uniqueIncoming])].slice(-1000),
  };
}
