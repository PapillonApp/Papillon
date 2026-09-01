import { afterEach, describe, expect, it, jest } from "@jest/globals";

import {
  getMyCpeConfiguration,
  loginMyCpe,
  MyCpeApiClient,
  MyCpeApiError,
  MyCpeApiErrorCode,
  MyCpeAuthenticationError,
  MyCpeFetch,
} from "./api";

const response = (body: unknown, status = 200, raw = false): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn(async () => (raw ? String(body) : JSON.stringify(body))),
  }) as unknown as Response;

const asFetch = (mock: ReturnType<typeof jest.fn>): MyCpeFetch =>
  mock as unknown as MyCpeFetch;

describe("MyCpeApiClient", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("authenticates with JSON without exposing an Authorization header", async () => {
    const fetchMock = jest.fn(async () =>
      response({ normal: "normal-token", comptage: "count-token" })
    );

    await expect(
      loginMyCpe("student", "secret", { fetchImpl: asFetch(fetchMock) })
    ).resolves.toEqual({
      normal: "normal-token",
      comptage: "count-token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const headers = new Headers(init.headers);
    expect(url).toBe("https://mycpe.cpe.fr/mobile/login");
    expect(init.method).toBe("POST");
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Authorization")).toBe(false);
    expect(JSON.parse(String(init.body))).toEqual({
      login: "student",
      password: "secret",
    });
  });

  it("calls every authenticated endpoint with the Bearer token", async () => {
    const results = [{ individu: { prenom: "Ada" } }, [], [], { absences: [] }];
    const fetchMock = jest.fn(async (_url?: unknown, _init?: RequestInit) =>
      response(results.shift())
    );
    const client = new MyCpeApiClient({
      token: "session-token",
      fetchImpl: asFetch(fetchMock),
    });

    await client.getConfiguration();
    await client.getPlanning("2026-08-31", "2026-09-06");
    await client.getGrades();
    await client.getAbsences();

    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      "https://mycpe.cpe.fr/mobile/configuration",
      "https://mycpe.cpe.fr/mobile/mon_planning?date_debut=2026-08-31&date_fin=2026-09-06",
      "https://mycpe.cpe.fr/mobile/mes_notes",
      "https://mycpe.cpe.fr/mobile/mes_absences",
    ]);
    fetchMock.mock.calls.forEach(call => {
      const init = call[1] as RequestInit;
      const headers = new Headers(init.headers);
      expect(init.method).toBe("GET");
      expect(headers.get("Authorization")).toBe("Bearer session-token");
      expect(headers.get("Accept")).toBe("application/json");
    });
  });

  it("exposes a token-based configuration helper", async () => {
    const fetchMock = jest.fn(async () =>
      response({ individu: { nom: "Lovelace" } })
    );

    await expect(
      getMyCpeConfiguration("token", { fetchImpl: asFetch(fetchMock) })
    ).resolves.toEqual({ individu: { nom: "Lovelace" } });
  });

  it("normalizes the empty 204 grades response returned before grades exist", async () => {
    const fetchMock = jest.fn(async () => response("", 204, true));
    const client = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(fetchMock),
    });

    await expect(client.getGrades()).resolves.toEqual([]);
  });

  it("normalizes a null absences collection to an empty list", async () => {
    const fetchMock = jest.fn(async () =>
      response({
        nbr_total_absence_excuser: 0,
        nbr_total_absence_non_excuser: 0,
        absences: null,
      })
    );
    const client = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(fetchMock),
    });

    await expect(client.getAbsences()).resolves.toMatchObject({ absences: [] });
  });

  it.each([401, 403] as const)(
    "turns HTTP %i into a typed authentication error",
    async status => {
      const fetchMock = jest.fn(async () =>
        response(
          status === 403
            ? { message: "HTTP 403 Bad credentials" }
            : "<html>Unauthorized</html>",
          status,
          status === 401
        )
      );
      const client = new MyCpeApiClient({
        token: "invalid",
        fetchImpl: asFetch(fetchMock),
      });

      const request = client.getGrades();
      await expect(request).rejects.toBeInstanceOf(MyCpeAuthenticationError);
      await expect(request).rejects.toMatchObject({
        code: MyCpeApiErrorCode.AUTHENTICATION,
        status,
      });
    }
  );

  it("does not call the network when an authenticated request has no token", async () => {
    const fetchMock = jest.fn(async () => response([]));
    const client = new MyCpeApiClient({ fetchImpl: asFetch(fetchMock) });

    await expect(client.getGrades()).rejects.toBeInstanceOf(
      MyCpeAuthenticationError
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves non-authentication HTTP status and safe API messages", async () => {
    const fetchMock = jest.fn(async () =>
      response({ message: "Service indisponible" }, 503)
    );
    const client = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(fetchMock),
    });

    await expect(client.getGrades()).rejects.toMatchObject({
      message: "Service indisponible",
      code: MyCpeApiErrorCode.HTTP,
      status: 503,
    });
  });

  it("rejects malformed JSON and unexpected response structures", async () => {
    const malformedFetch = jest.fn(async () => response("not-json", 200, true));
    const malformedClient = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(malformedFetch),
    });
    await expect(malformedClient.getGrades()).rejects.toMatchObject({
      code: MyCpeApiErrorCode.INVALID_RESPONSE,
    });

    const invalidShapeFetch = jest.fn(async () => response({ grades: [] }));
    const invalidShapeClient = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(invalidShapeFetch),
    });
    await expect(invalidShapeClient.getGrades()).rejects.toMatchObject({
      code: MyCpeApiErrorCode.INVALID_RESPONSE,
    });
  });

  it("turns fetch failures into a typed network error", async () => {
    const fetchMock = jest.fn(async () => {
      throw new Error("socket closed");
    });
    const client = new MyCpeApiClient({
      token: "token",
      fetchImpl: asFetch(fetchMock),
    });

    await expect(client.getGrades()).rejects.toEqual(
      expect.objectContaining({
        code: MyCpeApiErrorCode.NETWORK,
      })
    );
  });

  it("aborts and types requests that exceed the configured timeout", async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn(
      async (_url: unknown, init?: RequestInit): Promise<Response> =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted"))
          );
        })
    );
    const client = new MyCpeApiClient({
      token: "token",
      timeoutMs: 50,
      fetchImpl: asFetch(fetchMock),
    });

    const request = client.getGrades();
    const assertion = expect(request).rejects.toEqual(
      expect.objectContaining({ code: MyCpeApiErrorCode.TIMEOUT })
    );
    jest.advanceTimersByTime(50);
    await assertion;
  });

  it("uses the exported API error class for non-authentication failures", () => {
    const apiError = new MyCpeApiError("failure", MyCpeApiErrorCode.HTTP, 500);
    expect(apiError).toBeInstanceOf(Error);
    expect(apiError.name).toBe("MyCpeApiError");
  });
});
