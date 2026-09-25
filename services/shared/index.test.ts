import { describe, expect, it, jest } from "@jest/globals";

import { AccountManager } from "@/services/shared";
import { Capabilities, type SchoolServicePlugin } from "@/services/shared/types";
import { Services } from "@/stores/account/types";

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(async () => ({ isInternetReachable: true })),
}));
jest.mock("@/database/useAttendance", () => ({ addAttendanceToDatabase: jest.fn(), getAttendanceFromCache: jest.fn() }));
jest.mock("@/database/useBalance", () => ({ addBalancesToDatabase: jest.fn(), getBalancesFromCache: jest.fn() }));
jest.mock("@/database/useCanteen", () => ({ addCanteenMenuToDatabase: jest.fn(), addCanteenTransactionToDatabase: jest.fn(), getCanteenMenuFromCache: jest.fn(), getCanteenTransactionsFromCache: jest.fn() }));
jest.mock("@/database/useChat", () => ({ addChatsToDatabase: jest.fn(), addMessagesToDatabase: jest.fn(), addRecipientsToDatabase: jest.fn(), getChatsFromCache: jest.fn(), getMessagesFromCache: jest.fn(), getRecipientsFromCache: jest.fn() }));
jest.mock("@/database/useGrades", () => ({ addPeriodGradesToDatabase: jest.fn(), addPeriodsToDatabase: jest.fn(), getGradePeriodsFromCache: jest.fn(), getPeriodsFromCache: jest.fn() }));
jest.mock("@/database/useHomework", () => ({ addHomeworkToDatabase: jest.fn(), getHomeworksFromCache: jest.fn() }));
jest.mock("@/database/useKids", () => ({ addKidToDatabase: jest.fn(), getKidsFromCache: jest.fn() }));
jest.mock("@/database/useNews", () => ({ addNewsToDatabase: jest.fn(), getNewsFromCache: jest.fn() }));
jest.mock("@/database/useTimetable", () => ({ addCourseDayToDatabase: jest.fn(), getCoursesFromCache: jest.fn() }));
jest.mock("@/stores/account", () => ({ useAccountStore: { getState: jest.fn(() => ({ accounts: [] })) } }));
jest.mock("@/utils/logger/logger", () => ({
  debug: jest.fn(),
  error: jest.fn((message: string) => new Error(message)),
  log: jest.fn(),
  warn: jest.fn(),
}));

describe("AccountManager single-result dispatch", () => {
  it("tries the next compatible service when one service fails", async () => {
    const account = { id: "account-1", services: [] } as never;
    const manager = new AccountManager(account);
    const failedService = {
      id: "pronote-1",
      displayName: "PRONOTE unavailable",
      service: Services.PRONOTE,
      capabilities: [Capabilities.GRADES],
      requiresInternet: false,
    };
    const workingService = {
      id: "pronote-2",
      displayName: "PRONOTE",
      service: Services.PRONOTE,
      capabilities: [Capabilities.GRADES],
      requiresInternet: false,
    };
    const clients = (manager as unknown as { clients: Record<string, SchoolServicePlugin> }).clients;
    clients[failedService.id] = failedService as unknown as SchoolServicePlugin;
    clients[workingService.id] = workingService as unknown as SchoolServicePlugin;
    const callback = jest.fn(async (client: SchoolServicePlugin) => {
      if (client.displayName === failedService.displayName) throw new Error("temporary failure");
      return { createdByAccount: workingService.id };
    });

    const result = await (manager as unknown as {
      fetchData<T>(
        capability: Capabilities,
        callback: (client: SchoolServicePlugin) => Promise<T>,
        options: { multiple: false },
      ): Promise<T>;
    }).fetchData(Capabilities.GRADES, callback, { multiple: false });

    expect(result).toEqual({ createdByAccount: workingService.id });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(manager.getFailures(Capabilities.GRADES)).toHaveLength(1);
  });
});
