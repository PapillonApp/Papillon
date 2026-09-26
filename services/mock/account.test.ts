import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { Account, ServiceAccount, Services } from "@/stores/account/types";

let mockState: {
  accounts: Account[];
  lastUsedAccount: string;
  addAccount: (account: Account) => void;
  setLastUsedAccount: (accountId: string) => void;
  addServiceToAccount: (accountId: string, service: ServiceAccount) => void;
};

jest.mock("expo-router", () => ({
  router: {
    dismissAll: jest.fn(),
    replace: jest.fn(),
  },
}));
jest.mock("@/services/shared", () => ({
  initializeAccountManager: jest.fn(async () => undefined),
}));
jest.mock("@/stores/account", () => ({
  useAccountStore: { getState: () => mockState },
}));
jest.mock("@/utils/uuid/uuid", () => {
  let id = 0;
  return { __esModule: true, default: () => `mock-uuid-${++id}` };
});

import { attachMockDataToCurrentAccount, createMockProfile } from "./account";

const createState = () => {
  mockState = {
    accounts: [],
    lastUsedAccount: "",
    addAccount: account => {
      mockState.accounts.push(account);
    },
    setLastUsedAccount: accountId => {
      mockState.lastUsedAccount = accountId;
    },
    addServiceToAccount: (accountId, service) => {
      mockState.accounts = mockState.accounts.map(account =>
        account.id === accountId
          ? { ...account, services: [...account.services, service] }
          : account
      );
    },
  };
};

describe("Mock Data account setup", () => {
  beforeEach(createState);

  it("creates and reuses the default mock profile", async () => {
    const first = await createMockProfile();
    const second = await createMockProfile();

    expect(first.id).toBe(second.id);
    expect(mockState.accounts).toHaveLength(1);
    expect(mockState.lastUsedAccount).toBe(first.id);
    expect(first.services[0].serviceId).toBe(Services.MOCK_DATA);
  });

  it("attaches Mock Data to the current account only once", async () => {
    const now = new Date().toISOString();
    mockState.accounts = [
      {
        id: "offline-profile",
        firstName: "Alex",
        lastName: "Durand",
        custom: true,
        services: [],
        createdAt: now,
        updatedAt: now,
      },
    ];
    mockState.lastUsedAccount = "offline-profile";

    await attachMockDataToCurrentAccount();
    await attachMockDataToCurrentAccount();

    const services = mockState.accounts[0].services;
    expect(services).toHaveLength(1);
    expect(services[0].serviceId).toBe(Services.MOCK_DATA);
    expect(mockState.accounts[0].firstName).toBe("Alex");
  });
});
