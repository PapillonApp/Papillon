import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(async () => ({ isInternetReachable: false })),
}));
jest.mock("@/database/useAttendance", () => ({}));
jest.mock("@/database/useBalance", () => ({}));
jest.mock("@/database/useCanteen", () => ({}));
jest.mock("@/database/useChat", () => ({}));
jest.mock("@/database/useGrades", () => ({}));
jest.mock("@/database/useHomework", () => ({}));
jest.mock("@/database/useKids", () => ({}));
jest.mock("@/database/useNews", () => ({}));
jest.mock("@/database/useTimetable", () => ({}));
jest.mock("@/stores/account", () => ({
  useAccountStore: { getState: jest.fn() },
}));
jest.mock("@/utils/logger/logger", () => ({
  error: jest.fn((message: string) => {
    throw new Error(message);
  }),
  log: jest.fn(),
  warn: jest.fn(),
}));

import { AccountManager } from "@/services/shared";
import { Capabilities } from "@/services/shared/types";
import { Account, Services } from "@/stores/account/types";

describe("Mock Data account manager integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes the mock client while the device is offline", async () => {
    const now = new Date().toISOString();
    const account: Account = {
      id: "profile-id",
      firstName: "Camille",
      lastName: "Martin",
      services: [
        {
          id: "mock-service-id",
          serviceId: Services.MOCK_DATA,
          auth: {},
          createdAt: now,
          updatedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const manager = new AccountManager(account);
    await expect(manager.refreshAllAccounts()).resolves.toBe(false);
    expect(
      manager.clientHasCapatibility(Capabilities.TIMETABLE, "mock-service-id")
    ).toBe(true);
    expect(
      manager.clientHasCapatibility(Capabilities.HOMEWORK, "mock-service-id")
    ).toBe(true);
  });
});
