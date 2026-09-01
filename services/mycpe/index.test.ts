import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { Capabilities } from "@/services/shared/types";

const mockGetItemAsync = jest.fn(
  async (_key: string): Promise<string | null> => "stored-token"
);
const mockSetItemAsync = jest.fn(async (_key: string, _value: string) => {});
const mockDeleteItemAsync = jest.fn(async (_key: string) => {});

const secureStore = {
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
};

import { MyCpeAuthenticationError, MyCpeFetch } from "./api";
import { MyCpe, getMyCpeCapabilities } from "./index";

const response = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    text: jest.fn(async () => JSON.stringify(body)),
  }) as unknown as Response;

const asFetch = (mock: ReturnType<typeof jest.fn>): MyCpeFetch =>
  mock as unknown as MyCpeFetch;

describe("MyCpe provider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue("stored-token");
  });

  it("reloads the token, validates it and keeps only the username in authData", async () => {
    const fetchMock = jest.fn(async () =>
      response({
        individu: { prenom: "Ada", nom: "Lovelace" },
        visibilite: {
          est_visible_mon_planning: true,
          est_visible_mes_notes: false,
          est_visible_mes_absences: false,
        },
      })
    );
    const provider = new MyCpe("service-account", {
      fetchImpl: asFetch(fetchMock),
      tokenStore: secureStore,
    });

    await expect(
      provider.refreshAccount({
        accessToken: "must-not-survive",
        refreshToken: "must-not-survive",
        additionals: {
          username: " ada@student.cpe.fr ",
          password: "must-not-survive",
        },
      })
    ).resolves.toBe(provider);

    expect(mockGetItemAsync).toHaveBeenCalledWith(
      "papillon.mycpe.token.service-account"
    );
    expect(provider.requiresInternet).toBe(true);
    expect(provider.displayName).toBe("My CPE Lyon");
    expect(provider.authData).toEqual({
      additionals: { username: "ada@student.cpe.fr" },
    });
    expect(JSON.stringify(provider.authData)).not.toContain("must-not-survive");
    expect(provider.configuration?.individu?.prenom).toBe("Ada");
    expect(provider.capabilities).toEqual([
      Capabilities.REFRESH,
      Capabilities.TIMETABLE,
    ]);

    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer stored-token"
    );
  });

  it("enables all data capabilities when visibility flags are absent", () => {
    expect(getMyCpeCapabilities({})).toEqual([
      Capabilities.REFRESH,
      Capabilities.TIMETABLE,
      Capabilities.GRADES,
      Capabilities.ATTENDANCE,
      Capabilities.ATTENDANCE_PERIODS,
    ]);
  });

  it("throws a typed authentication error when SecureStore has no token", async () => {
    mockGetItemAsync.mockResolvedValueOnce(null);
    const fetchMock = jest.fn(async () => response({}));
    const provider = new MyCpe("service-account", {
      fetchImpl: asFetch(fetchMock),
      tokenStore: secureStore,
    });

    await expect(provider.refreshAccount({})).rejects.toBeInstanceOf(
      MyCpeAuthenticationError
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(provider.session).toBeUndefined();
  });

  it("exposes one shared synthetic period for grades and attendance", async () => {
    const provider = new MyCpe("service-account", {
      now: () => new Date(2026, 1, 15),
    });

    const gradePeriods = await provider.getGradesPeriods();
    const attendancePeriods = await provider.getAttendancePeriods();

    expect(gradePeriods).toEqual(attendancePeriods);
    expect(gradePeriods).toHaveLength(1);
    expect(gradePeriods[0]).toMatchObject({
      name: "Année universitaire 2025-2026",
      createdByAccount: "service-account",
    });
  });

  it("refreshes configuration and recalculates capabilities", async () => {
    const configurations = [
      {},
      {
        visibilite: {
          est_visible_mon_planning: false,
          est_visible_mes_notes: true,
          est_visible_mes_absences: false,
        },
      },
    ];
    const fetchMock = jest.fn(async () => response(configurations.shift()));
    const provider = new MyCpe("service-account", {
      fetchImpl: asFetch(fetchMock),
      tokenStore: secureStore,
    });

    await provider.refreshAccount({});
    await provider.getConfiguration();

    expect(provider.capabilities).toEqual([
      Capabilities.REFRESH,
      Capabilities.GRADES,
    ]);
  });
});
