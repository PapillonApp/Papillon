import { fetch as expoFetch } from "expo/fetch";

import {
  MyCpeAbsencesResponse,
  MyCpeAbsence,
  MyCpeConfiguration,
  MyCpeCourseGrades,
  MyCpeLoginResponse,
  MyCpePlanningEvent,
} from "./models";

export const MYCPE_API_BASE_URL = "https://mycpe.cpe.fr/mobile/";
export const MYCPE_REQUEST_TIMEOUT_MS = 30_000;

export type MyCpeFetch = typeof globalThis.fetch;

export enum MyCpeApiErrorCode {
  AUTHENTICATION = "AUTHENTICATION",
  HTTP = "HTTP",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
}

export class MyCpeApiError extends Error {
  constructor(
    message: string,
    public readonly code: MyCpeApiErrorCode,
    public readonly status?: number
  ) {
    super(message);
    this.name = "MyCpeApiError";
  }
}

export class MyCpeAuthenticationError extends MyCpeApiError {
  constructor(message: string, status?: 401 | 403) {
    super(message, MyCpeApiErrorCode.AUTHENTICATION, status);
    this.name = "MyCpeAuthenticationError";
  }
}

export interface MyCpeApiClientOptions {
  token?: string;
  fetchImpl?: MyCpeFetch;
  baseUrl?: string;
  timeoutMs?: number;
}

type JsonValidator<T> = (value: unknown) => value is T;
type MyCpeAbsencesPayload = Omit<MyCpeAbsencesResponse, "absences"> & {
  absences: MyCpeAbsence[] | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isLoginResponse = (value: unknown): value is MyCpeLoginResponse =>
  isRecord(value) &&
  typeof value.normal === "string" &&
  value.normal.trim().length > 0;

const isConfiguration = (value: unknown): value is MyCpeConfiguration =>
  isRecord(value);

const isPlanning = (value: unknown): value is MyCpePlanningEvent[] =>
  Array.isArray(value) && value.every(isRecord);

const isGrades = (value: unknown): value is MyCpeCourseGrades[] =>
  Array.isArray(value) && value.every(isRecord);

const isAbsencesResponse = (value: unknown): value is MyCpeAbsencesPayload =>
  isRecord(value) &&
  (value.absences === null ||
    (Array.isArray(value.absences) && value.absences.every(isRecord)));

const extractErrorMessage = (body: string): string | undefined => {
  if (!body.trim()) {
    return undefined;
  }

  try {
    const payload: unknown = JSON.parse(body);
    if (!isRecord(payload)) {
      return undefined;
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }

    const label = payload["http_status_label"];
    return typeof label === "string" && label.trim() ? label.trim() : undefined;
  } catch {
    return undefined;
  }
};

export class MyCpeApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: MyCpeFetch;
  private readonly timeoutMs: number;
  private readonly token?: string;

  constructor(options: MyCpeApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? MYCPE_API_BASE_URL).replace(/\/?$/, "/");
    this.fetchImpl = options.fetchImpl ?? (expoFetch as MyCpeFetch);
    this.timeoutMs = options.timeoutMs ?? MYCPE_REQUEST_TIMEOUT_MS;
    this.token = options.token;
  }

  async login(login: string, password: string): Promise<MyCpeLoginResponse> {
    return this.requestJson(
      "login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      },
      isLoginResponse
    );
  }

  async getConfiguration(): Promise<MyCpeConfiguration> {
    return this.requestJson(
      "configuration",
      { method: "GET" },
      isConfiguration,
      true
    );
  }

  async getPlanning(
    startDate: string,
    endDate: string
  ): Promise<MyCpePlanningEvent[]> {
    const query =
      `date_debut=${encodeURIComponent(startDate)}` +
      `&date_fin=${encodeURIComponent(endDate)}`;
    return this.requestJson(
      `mon_planning?${query}`,
      { method: "GET" },
      isPlanning,
      true,
      []
    );
  }

  async getGrades(): Promise<MyCpeCourseGrades[]> {
    return this.requestJson("mes_notes", { method: "GET" }, isGrades, true, []);
  }

  async getAbsences(): Promise<MyCpeAbsencesResponse> {
    const payload = await this.requestJson(
      "mes_absences",
      { method: "GET" },
      isAbsencesResponse,
      true
    );
    return { ...payload, absences: payload.absences ?? [] };
  }

  private async requestJson<T>(
    path: string,
    init: RequestInit,
    validator: JsonValidator<T>,
    authenticated = false,
    emptyResponse?: T
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    if (authenticated) {
      if (!this.token?.trim()) {
        throw new MyCpeAuthenticationError(
          "Aucun jeton de connexion My CPE n'est disponible."
        );
      }
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);

    let response: Response;
    let body: string;
    try {
      try {
        response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          ...init,
          headers,
          signal: controller.signal,
        });
      } catch {
        if (timedOut) {
          throw new MyCpeApiError(
            "La requête My CPE a expiré.",
            MyCpeApiErrorCode.TIMEOUT
          );
        }

        throw new MyCpeApiError(
          "Impossible de contacter My CPE.",
          MyCpeApiErrorCode.NETWORK
        );
      }

      if (timedOut) {
        throw new MyCpeApiError(
          "La requête My CPE a expiré.",
          MyCpeApiErrorCode.TIMEOUT
        );
      }

      try {
        body = await response.text();
      } catch {
        if (timedOut) {
          throw new MyCpeApiError(
            "La requête My CPE a expiré.",
            MyCpeApiErrorCode.TIMEOUT
          );
        }

        throw new MyCpeApiError(
          "My CPE a renvoyé une réponse illisible.",
          MyCpeApiErrorCode.INVALID_RESPONSE,
          response.status
        );
      }
    } finally {
      clearTimeout(timeout);
    }

    if (timedOut) {
      throw new MyCpeApiError(
        "La requête My CPE a expiré.",
        MyCpeApiErrorCode.TIMEOUT
      );
    }

    if (!response.ok) {
      const apiMessage = extractErrorMessage(body);
      if (response.status === 401 || response.status === 403) {
        throw new MyCpeAuthenticationError(
          apiMessage ?? "Les identifiants ou la session My CPE sont invalides.",
          response.status
        );
      }

      throw new MyCpeApiError(
        apiMessage ?? `My CPE a renvoyé l'erreur HTTP ${response.status}.`,
        MyCpeApiErrorCode.HTTP,
        response.status
      );
    }

    if (!body.trim() && emptyResponse !== undefined) {
      return emptyResponse;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new MyCpeApiError(
        "My CPE a renvoyé un JSON invalide.",
        MyCpeApiErrorCode.INVALID_RESPONSE,
        response.status
      );
    }

    if (!validator(payload)) {
      throw new MyCpeApiError(
        "La structure de la réponse My CPE est invalide.",
        MyCpeApiErrorCode.INVALID_RESPONSE,
        response.status
      );
    }

    return payload;
  }
}

export async function loginMyCpe(
  login: string,
  password: string,
  options: Omit<MyCpeApiClientOptions, "token"> = {}
): Promise<MyCpeLoginResponse> {
  return new MyCpeApiClient(options).login(login, password);
}

export async function getMyCpeConfiguration(
  token: string,
  options: Omit<MyCpeApiClientOptions, "token"> = {}
): Promise<MyCpeConfiguration> {
  return new MyCpeApiClient({ ...options, token }).getConfiguration();
}
