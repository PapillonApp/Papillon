import { useSettingsStore } from "@/stores/settings";

export const DEFAULT_PRONOTE_API_URL =
  process.env.EXPO_PUBLIC_PRONOTE_API_URL || "https://aether-pronote-api.vercel.app";

export function getPronoteApiBaseUrl(): string {
  const customUrl = useSettingsStore.getState().personalization.pronoteApiUrl;
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/+$/, "");
  }
  return DEFAULT_PRONOTE_API_URL.replace(/\/+$/, "");
}

export class PronoteHttpError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    // Message compatible avec l'ancien format ("HTTP 401 ..."/detail brut)
    // pour les callers qui font du substring-match.
    super(detail.includes(`HTTP ${status}`) ? detail : `HTTP ${status}: ${detail}`);
    this.name = "PronoteHttpError";
    this.status = status;
    this.detail = detail;
  }
}

/** GET en vol coalescés par endpoint+params (switch de semaine rapide, double mount). */
const inFlightGets = new Map<string, Promise<any>>();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function request<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    authToken?: string;
    params?: Record<string, string | undefined>;
    /** Désactive le retry (identifiants à usage unique : QR jeton, token). */
    retry?: boolean;
    /** Timeout ms (défaut 20000). Téléchargements lourds : 60000. */
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const baseUrl = getPronoteApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null) {
        searchParams.append(k, v);
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.authToken) {
    headers["X-Pronote-Auth"] = options.authToken;
  }

  const isNetworkFailure = (e: unknown): boolean => {
    if (e instanceof TypeError) return true;
    const name = (e as any)?.name;
    if (name === "AbortError") return true;
    const msg = String((e as any)?.message || e).toLowerCase();
    return msg.includes("abort") || msg.includes("network request failed") || msg.includes("fetch failed");
  };

  const doFetchOnce = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal as any,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  };

  const isGet = !options.method || options.method.toUpperCase() === "GET";
  // Clé de dédup incluant le compte (hash du token) : sans ça, deux comptes
  // interrogeant la même semaine partageaient la même promesse (fuite inter-comptes).
  const tokenHash = options.authToken
    ? String(options.authToken.length) + ":" + String(options.authToken.slice(0, 12))
    : "noauth";
  const dedupKey = isGet ? `${options.method ?? "GET"} ${url} ${tokenHash}` : null;
  if (dedupKey && inFlightGets.has(dedupKey)) {
    return inFlightGets.get(dedupKey) as Promise<T>;
  }

  const exec = (async (): Promise<T> => {
    const retriable = (e: unknown, status?: number): boolean => {
      if (options.retry === false) return false;
      if (status !== undefined) return status === 502 || status === 503 || status === 504;
      return isNetworkFailure(e);
    };

    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let response: Response;
      try {
        response = await doFetchOnce();
      } catch (e) {
        if (retriable(e) && attempt < 2) {
          attempt += 1;
          await sleep(500 * 2 ** (attempt - 1) + Math.random() * 250);
          continue;
        }
        throw e;
      }

      if (!response.ok) {
        let errDetail = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errDetail = errJson.detail;
        } catch {}
        // Backend mal déployé (rewrite Vercel cassé, mauvaise URL custom) :
        // FastAPI renvoie `{"detail":"Not Found"}` pour toute route inconnue.
        // Remonte un message actionnable au lieu d'un 404 brut.
        if (
          response.status === 404 &&
          /not found/i.test(errDetail)
        ) {
          errDetail =
            "Serveur API Aether injoignable (404 Not Found). " +
            "Vérifie l'URL dans Personnalisation > Serveur API Pronote " +
            `(${baseUrl}) ou redéploie le backend (Root Directory=backend, sans rewrite : Vercel route tout vers l'app FastAPI).`;
        }
        // Préserve le statut (vs substring-match) ; retry backoff sur 502/503/504.
        if (retriable(null, response.status) && attempt < 2) {
          attempt += 1;
          const retryAfter = Number(response.headers?.get?.("Retry-After") ?? 0);
          await sleep(
            (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1)) +
              Math.random() * 250
          );
          continue;
        }
        throw new PronoteHttpError(response.status, errDetail);
      }

      return response.json();
    }
  })();

  if (dedupKey) {
    inFlightGets.set(dedupKey, exec);
    try {
      return await exec;
    } finally {
      if (inFlightGets.get(dedupKey) === exec) inFlightGets.delete(dedupKey);
    }
  }
  return exec;
}

export interface PronoteLoginResult {
  success: boolean;
  user: {
    name: string;
    class_name?: string;
    establishment?: string;
    account_type: "eleve" | "parent";
  };
  children: Array<{ id?: string; name: string; grade?: string }>;
  auth_token: string;
  client_identifier?: string | null;
  credentials?: Record<string, any>;
}

export interface MFALoginOptions {
  accountPin?: string;
  clientIdentifier?: string;
  deviceName?: string;
  skip2fa?: boolean;
}

export const PronoteApiClient = {
  async directLogin(
    url: string,
    username: string,
    password: string,
    ent?: string,
    accountType: "eleve" | "parent" = "eleve",
    mfa?: MFALoginOptions
  ): Promise<PronoteLoginResult> {
    return request<PronoteLoginResult>("/auth/login", {
      method: "POST",
      retry: false,
      body: {
        url,
        username,
        password,
        ent,
        account_type: accountType,
        account_pin: mfa?.accountPin,
        client_identifier: mfa?.clientIdentifier,
        device_name: mfa?.deviceName,
      },
    });
  },

  async qrCodeLogin(
    qrData: any,
    pin: string,
    uuid: string,
    accountType: "eleve" | "parent" = "eleve",
    mfa?: MFALoginOptions
  ): Promise<PronoteLoginResult> {
    return request<PronoteLoginResult>("/auth/qrcode", {
      method: "POST",
      retry: false,
      body: {
        qr_data: qrData,
        pin,
        uuid,
        account_type: accountType,
        account_pin: mfa?.accountPin,
        client_identifier: mfa?.clientIdentifier,
        device_name: mfa?.deviceName,
        skip_2fa: mfa?.skip2fa ?? false,
      },
    });
  },

  async tokenLogin(
    url: string,
    username: string,
    token: string,
    uuid: string,
    accountType: "eleve" | "parent" = "eleve",
    mfa?: MFALoginOptions
  ): Promise<PronoteLoginResult> {
    return request<PronoteLoginResult>("/auth/token", {
      method: "POST",
      retry: false,
      body: {
        url,
        username,
        token,
        uuid,
        account_type: accountType,
        account_pin: mfa?.accountPin,
        client_identifier: mfa?.clientIdentifier,
        device_name: mfa?.deviceName,
      },
    });
  },

  async requestQrCode(authToken: string, pin: string, child?: string): Promise<{ qr: any }> {
    return request("/auth/request-qr", {
      method: "POST",
      authToken,
      retry: false,
      body: { pin, child_name: child },
    });
  },

  async getCurrentPeriod(authToken: string, child?: string): Promise<{ period: any }> {
    return request("/periods/current", { authToken, params: { child } });
  },

  async getSessionInfo(authToken: string, child?: string): Promise<{ start_day: string; week: number; logged_in: boolean; last_connection: string | null }> {
    return request("/session/info", { authToken, params: { child } });
  },

  async getMeta(): Promise<{ pronotepy_version: string; grade_translate: string[]; ents: string[]; supported_account_types: string[] }> {
    return request("/meta", {});
  },

  async getEnts(): Promise<{ ents: string[] }> {
    return request("/meta/ents", {});
  },

  async getParentChildren(authToken: string): Promise<{ children: Array<{ id?: string; name: string; grade?: string }> }> {
    return request("/parent/children", { authToken });
  },

  async getTimetable(
    authToken: string,
    fromDate: string,
    toDate: string,
    child?: string
  ): Promise<{ lessons: any[] }> {
    return request("/timetable", {
      authToken,
      params: { from_date: fromDate, to_date: toDate, child },
    });
  },

  async getLessonContent(
    authToken: string,
    opts: { lessonId?: string; lessonStart?: string; subject?: string; date?: string; child?: string }
  ): Promise<{ contents: any[] }> {
    return request("/timetable/lesson-content", {
      method: "POST",
      authToken,
      body: {
        lesson_id: opts.lessonId,
        lesson_start: opts.lessonStart,
        subject: opts.subject,
        date: opts.date,
        child_name: opts.child,
      },
      timeoutMs: 30000,
    });
  },

  async getTimetableContents(
    authToken: string,
    fromDate: string,
    toDate: string,
    child?: string
  ): Promise<{ contents: any[] }> {
    return request("/timetable/contents", {
      authToken,
      params: { from_date: fromDate, to_date: toDate, child },
    });
  },

  async getGrades(
    authToken: string,
    period?: string,
    child?: string
  ): Promise<{ period: string; grades: any[]; averages: any }> {
    return request("/grades", {
      authToken,
      params: { period, child },
    });
  },

  async getGradePeriods(authToken: string, child?: string): Promise<{ periods: any[] }> {
    return request("/grades/periods", {
      authToken,
      params: { child },
    });
  },

  async getHomework(
    authToken: string,
    fromDate: string,
    toDate: string,
    child?: string
  ): Promise<{ homework: any[] }> {
    return request("/homework", {
      authToken,
      params: { from_date: fromDate, to_date: toDate, child },
    });
  },

  async setHomeworkDone(
    authToken: string,
    homeworkId: string,
    done: boolean,
    child?: string,
    dueDate?: string
  ): Promise<{ success: boolean; done: boolean }> {
    return request("/homework/done", {
      method: "POST",
      authToken,
      retry: false, // mutation : jamais rejouée en double
      body: {
        homework_id: homeworkId,
        done,
        child_name: child,
        due_date: dueDate,
      },
    });
  },

  async getAttendance(authToken: string, child?: string): Promise<{ absences: any[]; delays: any[]; punishments: any[] }> {
    return request("/attendance", {
      authToken,
      params: { child },
    });
  },

  async getNews(authToken: string, child?: string, opts?: { onlyUnread?: boolean; dateFrom?: string; dateTo?: string }): Promise<{ news: any[] }> {
    return request("/news", {
      authToken,
      params: {
        child,
        only_unread: opts?.onlyUnread ? "true" : undefined,
        date_from: opts?.dateFrom,
        date_to: opts?.dateTo,
      },
    });
  },

  async getCanteen(
    authToken: string,
    fromDate: string,
    toDate?: string,
    child?: string
  ): Promise<{ menus: any[] }> {
    return request("/canteen", {
      authToken,
      params: { from_date: fromDate, to_date: toDate, child },
    });
  },

  async getChats(authToken: string, child?: string, onlyUnread?: boolean): Promise<{ chats: any[] }> {
    return request("/chats", {
      authToken,
      params: { child, only_unread: onlyUnread ? "true" : undefined },
    });
  },

  async getChatMessages(authToken: string, chatId: string, child?: string): Promise<{ messages: any[] }> {
    return request(`/chats/${chatId}/messages`, {
      authToken,
      params: { child },
    });
  },

  async getChatParticipants(authToken: string, chatId: string, child?: string): Promise<{ participants: string[] }> {
    return request(`/chats/${chatId}/participants`, {
      authToken,
      params: { child },
    });
  },

  async markChatRead(authToken: string, chatId: string, read = true, child?: string): Promise<{ success: boolean }> {
    return request(`/chats/${chatId}/read`, {
      method: "POST",
      authToken,
      body: { chat_id: chatId, read, child_name: child },
    });
  },

  async deleteChat(authToken: string, chatId: string, child?: string): Promise<{ success: boolean }> {
    return request(`/chats/${chatId}/delete`, {
      method: "POST",
      authToken,
      body: { chat_id: chatId, child_name: child },
    });
  },

  async sendChatMessage(
    authToken: string,
    chatId: string,
    content: string,
    child?: string,
    messageId?: string
  ): Promise<{ success: boolean }> {
    return request("/chats/send", {
      method: "POST",
      authToken,
      body: {
        chat_id: chatId,
        content,
        child_name: child,
        message_id: messageId,
      },
    });
  },

  async getChatRecipients(authToken: string, child?: string): Promise<{ recipients: any[] }> {
    return request("/chats/recipients", {
      authToken,
      params: { child },
    });
  },

  async createChat(
    authToken: string,
    subject: string,
    content: string,
    recipientIds: string[],
    child?: string
  ): Promise<{ success: boolean; chat_id: string }> {
    return request("/chats/new", {
      method: "POST",
      authToken,
      body: {
        subject,
        content,
        recipient_ids: recipientIds,
        child_name: child,
      },
    });
  },

  async markNewsRead(authToken: string, newsId: string, child?: string): Promise<{ success: boolean }> {
    return request("/news/read", {
      method: "POST",
      authToken,
      body: {
        news_id: newsId,
        child_name: child,
      },
    });
  },

  async getEvaluations(
    authToken: string,
    period?: string,
    child?: string
  ): Promise<{ evaluations: any[] }> {
    return request("/evaluations", {
      authToken,
      params: { period, child },
    });
  },

  async getReport(
    authToken: string,
    period?: string,
    child?: string
  ): Promise<{ report: any }> {
    return request("/report", {
      authToken,
      params: { period, child },
    });
  },

  async getTeachingStaff(
    authToken: string,
    child?: string
  ): Promise<{ staff: any[] }> {
    return request("/teaching-staff", {
      authToken,
      params: { child },
    });
  },

  async getProfile(authToken: string, child?: string): Promise<{
    id?: string | null; name: string; class_name: string; establishment: string;
    address: string[]; email: string; phone: string; ine_number: string;
    delegue: string[]; has_profile_picture?: boolean;
  }> {
    return request("/profile", { authToken, params: { child } });
  },

  async getProfilePicture(authToken: string, child?: string): Promise<{ picture: string | null; mime?: string; name?: string }> {
    return request("/profile/picture", { authToken, params: { child } });
  },

  async getTimetablePdf(authToken: string, opts?: { day?: string; portrait?: boolean; overflow?: number; child?: string }): Promise<{ url: string }> {
    return request("/timetable/pdf", {
      authToken,
      params: {
        day: opts?.day,
        portrait: opts?.portrait ? "true" : undefined,
        overflow: opts?.overflow !== undefined ? String(opts.overflow) : undefined,
        child: opts?.child,
      },
    });
  },

  async getIcalUrl(
    authToken: string,
    child?: string
  ): Promise<{ url: string | null }> {
    return request("/ical-url", {
      authToken,
      params: { child },
    });
  },

  async downloadFile(
    authToken: string,
    fileUrl: string,
    fileName?: string,
    child?: string,
    dueDate?: string
  ): Promise<{ filename: string; mime: string; base64: string }> {
    // Route lourde (login pronotepy + scan + f.data, cold Vercel) :
    // 60s, sans retry (évite un double scan backend). due_date restreint
    // le scan backend à ±7j au lieu de 150j systématiques.
    return request("/files/download", {
      method: "POST",
      authToken,
      body: {
        file_url: fileUrl,
        file_name: fileName,
        child_name: child,
        due_date: dueDate,
      },
      timeoutMs: 60000,
      retry: false,
    });
  },

  async geolocation(coords: { latitude: number; longitude: number }): Promise<Array<{ name: string; url: string; distance: number; postalCode?: string }>> {
    return pronoteGeolocation(coords);
  }
};

export async function pronoteGeolocation(coords: { latitude: number; longitude: number }): Promise<Array<{ name: string; url: string; distance: number; postalCode?: string }>> {
  try {
    const body = new URLSearchParams();
    body.append("data", JSON.stringify({
      nomFonction: "geoLoc",
      lat: coords.latitude.toString(),
      long: coords.longitude.toString()
    }));
    const res = await fetch("https://www.index-education.com/swie/geoloc.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    const data = await res.json();
    return (data || []).map((item: any) => {
      const lat1 = coords.latitude;
      const lon1 = coords.longitude;
      const lat2 = parseFloat(item.lat || "0");
      const lon2 = parseFloat(item.long || "0");
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371000 * c;
      return {
        name: item.nomEtab || "",
        url: item.url || "",
        distance,
        postalCode: item.cp || ""
      };
    });
  } catch (e) {
    console.error("Pronote geolocation error:", e);
    return [];
  }
}

