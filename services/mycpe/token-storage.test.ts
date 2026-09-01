import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockSetItemAsync = jest.fn(async (_key: string, _value: string) => {});
const mockGetItemAsync = jest.fn(
  async (_key: string): Promise<string | null> => "stored-token"
);
const mockDeleteItemAsync = jest.fn(async (_key: string) => {});

import {
  deleteMyCpeToken,
  getMyCpeToken,
  getMyCpeTokenStorageKey,
  saveMyCpeToken,
} from "./token-storage";

const secureStore = {
  setItemAsync: mockSetItemAsync,
  getItemAsync: mockGetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
};

describe("My CPE token storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue("stored-token");
  });

  it("uses one deterministic SecureStore key per ServiceAccount", () => {
    expect(getMyCpeTokenStorageKey("service-account-1")).toBe(
      "papillon.mycpe.token.service-account-1"
    );
    expect(getMyCpeTokenStorageKey("service-account-1")).toBe(
      getMyCpeTokenStorageKey("service-account-1")
    );
    expect(getMyCpeTokenStorageKey("service-account-1")).not.toBe(
      getMyCpeTokenStorageKey("service-account-2")
    );
  });

  it("saves, reads and deletes only the bearer token", async () => {
    await saveMyCpeToken("service-account", "secret-token", secureStore);
    await expect(getMyCpeToken("service-account", secureStore)).resolves.toBe(
      "stored-token"
    );
    await deleteMyCpeToken("service-account", secureStore);

    const key = "papillon.mycpe.token.service-account";
    expect(mockSetItemAsync).toHaveBeenCalledWith(key, "secret-token");
    expect(mockGetItemAsync).toHaveBeenCalledWith(key);
    expect(mockDeleteItemAsync).toHaveBeenCalledWith(key);
  });

  it("rejects empty account IDs and tokens", async () => {
    expect(() => getMyCpeTokenStorageKey("  ")).toThrow();
    await expect(
      saveMyCpeToken("service-account", "  ", secureStore)
    ).rejects.toThrow();
    expect(mockSetItemAsync).not.toHaveBeenCalled();
  });
});
