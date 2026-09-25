import { describe, expect, it, beforeEach } from "@jest/globals";

import { getWeekNumberFromDate } from "@/database/useHomework";
import { AccountManager, getManager } from "@/services/shared";
import { Capabilities } from "@/services/shared/types";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import type { NotificationPreferences, Personalization } from "@/stores/settings/types";
import { getNextNotificationTime } from "@/utils/notifications";
import { runBackgroundNotificationSync } from "@/utils/notificationSync";
import {
  cancelSystemNotification,
  scheduleSystemNotification,
  showSystemNotification,
} from "@/utils/notifications";
import { isTauriDesktop } from "@/utils/network/fetch";

jest.mock("@/database/useHomework", () => ({ getWeekNumberFromDate: jest.fn(() => 39) }));
jest.mock("@/services/shared", () => ({ AccountManager: jest.fn(), getManager: jest.fn() }));
jest.mock("@/stores/account", () => ({ useAccountStore: { getState: jest.fn() } }));
jest.mock("@/stores/settings", () => ({ useSettingsStore: { getState: jest.fn() } }));
jest.mock("@/utils/logger/logger", () => ({ warn: jest.fn() }));
jest.mock("@/utils/network/fetch", () => ({ isTauriDesktop: jest.fn(() => true) }));
jest.mock("@/utils/notifications", () => ({
  cancelSystemNotification: jest.fn(),
  getNextNotificationTime: jest.fn((time: string, leadMinutes: number, reference = new Date()) => {
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(Number(reference ?? Date.now()));
    result.setHours(hours, minutes - leadMinutes, 0, 0);
    return result;
  }),
  scheduleSystemNotification: jest.fn(),
  showSystemNotification: jest.fn(),
}));

const mockedGetWeek = jest.mocked(getWeekNumberFromDate);
const mockedGetManager = jest.mocked(getManager);
const mockedAccountManager = jest.mocked(AccountManager);
const mockedAccountStore = jest.mocked(useAccountStore);
const mockedSettingsStore = jest.mocked(useSettingsStore);
const mockedIsTauriDesktop = jest.mocked(isTauriDesktop);
const mockedCancel = jest.mocked(cancelSystemNotification);
const mockedSchedule = jest.mocked(scheduleSystemNotification);
const mockedShow = jest.mocked(showSystemNotification);
const mockedNextNotificationTime = jest.mocked(getNextNotificationTime);

const now = new Date(2026, 8, 24, 10, 0, 0, 0);

function preferences(overrides: Partial<NotificationPreferences> = {}): NotificationPreferences {
  return {
    enabled: true,
    courses: true,
    homework: true,
    grades: true,
    news: true,
    dailyTime: "18:00",
    courseLeadMinutes: 15,
    serviceOverrides: {},
    ...overrides,
  };
}

function configureSync(notificationPreferences: NotificationPreferences) {
  const personalization: Personalization = { notificationPreferences, pendingNotificationSchedules: [] };
  const settingsState = {
    personalization,
    mutateProperty: (_section: "personalization", updates: Partial<Personalization>) => {
      Object.assign(personalization, updates);
    },
  };
  mockedSettingsStore.getState.mockReturnValue(settingsState as never);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  const courseStart = new Date(now.getTime() + 60 * 60 * 1000);
  let newsItems = [
    { id: "news-1", title: "Informations", createdAt: new Date(now), author: "Vie scolaire" },
  ];
  const client = {
    getWeeklyTimetable: jest.fn(async () => [{ courses: [{
      id: "course-1",
      subject: "Mathématiques",
      from: courseStart,
      status: undefined,
      type: undefined,
    }] }]),
    getHomeworks: jest.fn(async () => [{
      id: "homework-1",
      subject: "Français",
      dueDate: tomorrow,
      isDone: false,
    }]),
    getNews: jest.fn(async () => newsItems),
  };
  const entry = {
    id: "service-1",
    displayName: "PRONOTE",
    capabilities: [Capabilities.TIMETABLE, Capabilities.HOMEWORK, Capabilities.NEWS],
    plugin: client,
  };
  const manager = {
    getAccount: () => ({ id: "account-1" }),
    refreshAllAccounts: jest.fn(async () => undefined),
    getServiceClients: () => [entry],
  };
  mockedGetManager.mockReturnValue(manager as never);
  mockedAccountManager.mockImplementation(() => manager as never);
  mockedAccountStore.getState.mockReturnValue({
    accounts: [{ id: "account-1", services: [{ id: "service-1" }] }],
    lastUsedAccount: "account-1",
  } as never);

  mockedSchedule.mockImplementation(async (category, notification) => {
    const pending = personalization.pendingNotificationSchedules ?? [];
    settingsState.mutateProperty("personalization", {
      pendingNotificationSchedules: [...pending.filter(item => item.id !== notification.id), {
        id: notification.id,
        category,
        title: notification.title,
        body: notification.body,
        at: notification.at!.toISOString(),
        serviceId: notification.serviceId,
      }],
    });
  });
  mockedCancel.mockImplementation(async id => {
    settingsState.mutateProperty("personalization", {
      pendingNotificationSchedules: (personalization.pendingNotificationSchedules ?? []).filter(item => item.id !== id),
    });
  });

  return {
    personalization,
    addNews: (id: string) => {
      newsItems = [...newsItems, { id, title: "Nouvelle information", createdAt: new Date(now.getTime() + 1000), author: "Vie scolaire" }];
    },
  };
}

describe("background notification synchronization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetWeek.mockReturnValue(39);
    mockedIsTauriDesktop.mockReturnValue(true);
    mockedNextNotificationTime.mockImplementation((time, leadMinutes, reference = new Date()) => {
      const [hours, minutes] = time.split(":").map(Number);
      const result = new Date(Number(reference ?? Date.now()));
      result.setHours(hours, minutes - leadMinutes, 0, 0);
      return result;
    });
  });

  it("silently baselines existing news, sends each new item once, and schedules configured reminders", async () => {
    const fixture = configureSync(preferences());

    await runBackgroundNotificationSync(now);
    expect(mockedShow).not.toHaveBeenCalled();

    const courseReminder = mockedSchedule.mock.calls.find(([category]) => category === "courses")?.[1];
    const homeworkReminder = mockedSchedule.mock.calls.find(([category]) => category === "homework")?.[1];
    expect(courseReminder?.at).toEqual(new Date(now.getTime() + 45 * 60 * 1000));
    const dailyReminderAt = new Date(homeworkReminder?.at ?? 0);
    expect(dailyReminderAt.getHours()).toBe(18);

    fixture.addNews("news-2");
    await runBackgroundNotificationSync(now);
    await runBackgroundNotificationSync(now);

    expect(mockedShow).toHaveBeenCalledTimes(1);
    expect(mockedShow).toHaveBeenCalledWith("news", expect.objectContaining({ serviceId: "service-1" }));
  });

  it("honors per-service category switches", async () => {
    const fixture = configureSync(preferences({ serviceOverrides: { "service-1": { news: false } } }));
    await runBackgroundNotificationSync(now);
    fixture.addNews("news-2");
    await runBackgroundNotificationSync(now);

    expect(mockedShow).not.toHaveBeenCalled();
  });

  it("syncs during a pause without sending or replaying paused-period alerts", async () => {
    const fixture = configureSync(preferences({ pauseUntil: new Date(now.getTime() + 60 * 60 * 1000).toISOString() }));
    await runBackgroundNotificationSync(now);
    expect(mockedSchedule).toHaveBeenCalledTimes(2);
    fixture.addNews("news-2");
    await runBackgroundNotificationSync(now);
    expect(mockedShow).not.toHaveBeenCalled();

    fixture.personalization.notificationPreferences!.pauseUntil = new Date(now.getTime() - 1).toISOString();
    await runBackgroundNotificationSync(now);
    expect(mockedShow).not.toHaveBeenCalled();
  });
});
