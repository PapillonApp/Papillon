import { describe, expect, it } from "@jest/globals";

import {
  getNewNotificationKeys,
  isNotificationCategoryConfiguredEnabled,
  isNotificationCategoryEnabled,
  isNotificationPaused,
} from "@/utils/notificationPreferences";
import type { NotificationPreferences } from "@/stores/settings/types";

const preferences: NotificationPreferences = {
  enabled: true,
  courses: true,
  homework: true,
  grades: true,
  news: true,
  dailyTime: "18:00",
  serviceOverrides: { "school-1": { news: false } },
};

describe("notification preferences", () => {
  it("uses per-service category switches while respecting the master switch", () => {
    expect(isNotificationCategoryEnabled(preferences, "news", "school-1")).toBe(false);
    expect(isNotificationCategoryEnabled(preferences, "news", "school-2")).toBe(true);
    expect(isNotificationCategoryEnabled({ ...preferences, enabled: false }, "news", "school-2")).toBe(false);
  });

  it("pauses until the selected time or until manually resumed", () => {
    const pauseUntil = "2026-09-24T19:00:00.000Z";
    const pausedPreferences = { ...preferences, pauseUntil };
    expect(isNotificationPaused(pausedPreferences, Date.parse("2026-09-24T18:00:00.000Z"))).toBe(true);
    expect(isNotificationCategoryConfiguredEnabled(pausedPreferences, "courses", "school-2")).toBe(true);
    expect(isNotificationCategoryEnabled(pausedPreferences, "courses", "school-2", Date.parse("2026-09-24T18:00:00.000Z"))).toBe(false);
    expect(isNotificationPaused({ ...preferences, pauseUntil: "2026-09-24T17:00:00.000Z" }, Date.parse("2026-09-24T18:00:00.000Z"))).toBe(false);
    expect(isNotificationPaused({ ...preferences, pauseIndefinitely: true })).toBe(true);
  });

  it("takes a silent baseline on the first sync and detects only unseen items later", () => {
    expect(getNewNotificationKeys(undefined, ["a", "b"])).toEqual({
      isFirstSync: true,
      newKeys: [],
      allKeys: ["a", "b"],
    });
    expect(getNewNotificationKeys(["a"], ["a", "b", "b"])).toEqual({
      isFirstSync: false,
      newKeys: ["b"],
      allKeys: ["a", "b"],
    });
  });
});
