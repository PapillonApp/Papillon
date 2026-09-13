import { hasInternet as hasInternetCached } from "@/services/shared/network";

import {
  addAttendanceToDatabase,
  getAttendanceFromCache,
} from "@/database/useAttendance";
import {
  addBalancesToDatabase,
  getBalancesFromCache,
} from "@/database/useBalance";
import {
  addCanteenMenuToDatabase,
  addCanteenTransactionToDatabase,
  getCanteenMenuFromCache,
  getCanteenTransactionsFromCache,
} from "@/database/useCanteen";
import {
  addChatsToDatabase,
  addMessagesToDatabase,
  addRecipientsToDatabase,
  getChatsFromCache,
  getMessagesFromCache,
  getRecipientsFromCache,
} from "@/database/useChat";
import {
  addPeriodGradesToDatabase,
  addPeriodsToDatabase,
  getGradePeriodsFromCache,
  getPeriodsFromCache,
} from "@/database/useGrades";
import {
  addHomeworkToDatabase,
  getHomeworksFromCache,
} from "@/database/useHomework";
import { addKidToDatabase, getKidsFromCache } from "@/database/useKids";
import { addNewsToDatabase, getNewsFromCache } from "@/database/useNews";
import {
  addCourseDayToDatabase,
  getCoursesFromCache,
} from "@/database/useTimetable";
import { Attendance } from "@/services/shared/attendance";
import {
  Booking,
  BookingDay,
  CanteenHistoryItem,
  CanteenKind,
  CanteenMenu,
  QRCode,
} from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import {
  Period,
  PeriodGrades,
  Evaluation,
  Report,
} from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource, WeekLessonContent } from "@/services/shared/timetable";
import {
  Capabilities,
  FetchOptions,
  SchoolServicePlugin,
} from "@/services/shared/types";
import { useAccountStore } from "@/stores/account";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { error, log, warn } from "@/utils/logger/logger";

import { AuthenticationError } from "../errors/AuthenticationError";
import { ServiceUnavailableError } from "../errors/ServiceUnavailableError";

const isPermanentAuthError = (e: unknown): boolean => {
  if (!e) return false;
  // PronoteHttpError porte le statut : 429/5xx = transitoire, jamais un logout.
  const status = (e as any)?.status;
  if (
    status === 429 ||
    (typeof status === "number" && status >= 500 && status <= 599)
  ) {
    return false;
  }
  const msg = String((e as any)?.message || e).toLowerCase();
  // Marqueurs transitoires (throttling/timeout backend classés 429/504) :
  // ne déconnectent pas, même si le libellé évoque une session.
  if (
    msg.includes("429") ||
    msg.includes("504") ||
    msg.includes("surcharge") ||
    msg.includes("injoignable pour le moment") ||
    msg.includes("réessayez dans un instant") ||
    msg.includes("serveur lent ou injoignable")
  ) {
    return false;
  }
  return (
    msg.includes("401") ||
    msg.includes("badcredentials") ||
    msg.includes("identifiants incorrects") ||
    msg.includes("authenticate") ||
    msg.includes("sessionexpired") ||
    msg.includes("accessdenied") ||
    msg.includes("accountdisabled") ||
    msg.includes("security") ||
    msg.includes("session pronote expirée") ||
    msg.includes("reconnectez-vous") ||
    msg.includes("token expir") ||
    msg.includes("révoqu") ||
    msg.includes("revoked") ||
    msg.includes("expired") ||
    msg.includes("erreur d'initialisation") ||
    msg.includes("données d'authentification incomplètes")
  );
};
import { Balance } from "./balance";
import { Kid } from "./kid";
import { getSimpleCache, setSimpleCache } from "./simple-cache";
import { TeachingStaff } from "./staff";

export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(readonly account: Account) {}

  removeService(id: string): void {
    delete this.clients[id];
  }

  getAccount(): Account {
    return this.account;
  }

  async refreshAllAccounts(): Promise<boolean> {
    log("We're refreshing all services for the account " + this.account.id);
    const hasInternet = await this.hasInternet();

    let refreshedAtLeastOne = false;

    // Parallèle (pas séquentiel) : le switch compte/enfant ne doit pas
    // payer N handshakes Pronote en série.
    const results = await Promise.all(
      this.account.services.map(async service => {
        try {
          log("Trying to refresh " + service.id);
          const plugin = this.getServicePluginForAccount(service);

          if (!hasInternet && plugin.requiresInternet !== false) {
            warn(`Skipping network service ${service.id} while offline.`);
            return;
          }

          if (plugin?.capabilities.includes(Capabilities.REFRESH)) {
            this.clients[service.id] = await plugin.refreshAccount(
              service.auth
            );
            refreshedAtLeastOne = true;
            log("Successfully refreshed " + service.id);
          } else {
            this.clients[service.id] = plugin;
            log(
              "Plugin for " +
                service.id +
                " doesn't support refresh but is available for other capabilities"
            );
          }
        } catch (e) {
          if (isPermanentAuthError(e)) {
            throw new AuthenticationError(String(e), service);
          }
          throw new ServiceUnavailableError(String(e), service);
        }
      })
    );
    void results;

    log(
      "Finished refreshing process for all services, services refreshed: " +
        Object.keys(this.clients).length
    );

    if (
      !hasInternet &&
      Object.keys(this.clients).length === 0 &&
      this.account.services.length > 0
    ) {
      throw new Error(
        "Internet not reachable and no offline service is available."
      );
    }
    return refreshedAtLeastOne;
  }

  async getCanteenKind(clientId: string): Promise<CanteenKind> {
    return await this.fetchData(
      Capabilities.CANTEEN_BALANCE,
      async client =>
        client.getCanteenKind ? client.getCanteenKind() : CanteenKind.ARGENT,
      {
        multiple: false,
        clientId,
      }
    );
  }

  async getKids(): Promise<Kid[]> {
    return await this.fetchData(
      Capabilities.HAVE_KIDS,
      async client => (client.getKids ? client.getKids() : []),
      {
        multiple: true,
        fallback: async () => getKidsFromCache(),
        saveToCache: async (data: Kid[]) => {
          await addKidToDatabase(data);
        },
      }
    );
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    return await this.fetchData(
      Capabilities.HOMEWORK,
      async client =>
        client.getHomeworks ? await client.getHomeworks(weekNumber) : [],
      {
        multiple: true,
        fallback: async () => getHomeworksFromCache(weekNumber),
        saveToCache: async (data: Homework[]) => {
          await addHomeworkToDatabase(data);
        },
      }
    );
  }

  async getNews(opts?: { onlyUnread?: boolean }): Promise<News[]> {
    return await this.fetchData(
      Capabilities.NEWS,
      async client => (client.getNews ? await client.getNews(opts) : []),
      {
        multiple: true,
        fallback: async () => {
          const cached = await getNewsFromCache();
          if (opts?.onlyUnread) return cached.filter(n => !n.acknowledged);
          return cached;
        },
        saveToCache: async (data: News[]) => {
          await addNewsToDatabase(data);
        },
      }
    );
  }

  async getGradesForPeriod(
    period: Period,
    clientId: string,
    kid?: Kid
  ): Promise<PeriodGrades> {
    return await this.fetchData(
      Capabilities.GRADES,
      async client => {
        if (!client.getGradesForPeriod) {
          throw new Error("Bad Implementation");
        }
        return await client.getGradesForPeriod(period, kid);
      },
      {
        multiple: false,
        clientId,
        fallback: async () => getGradePeriodsFromCache(period.name, clientId),
        saveToCache: async (data: PeriodGrades) => {
          await addPeriodGradesToDatabase(data, period.name);
        },
      }
    );
  }

  async getGradesPeriods(): Promise<Period[]> {
    return await this.fetchData(
      Capabilities.GRADES,
      async client =>
        client.getGradesPeriods ? await client.getGradesPeriods() : [],
      {
        multiple: true,
        fallback: async () => getPeriodsFromCache(),
        saveToCache: async (data: Period[]) => {
          await addPeriodsToDatabase(data);
        },
      }
    );
  }

  /** Période courante backend (best-effort, null si indisponible). */
  async getCurrentPeriod(): Promise<Period | null> {
    try {
      const clients = Object.values(this.clients);
      for (const client of clients) {
        try {
          if (typeof (client as { getCurrentPeriod?: unknown }).getCurrentPeriod === "function") {
            const p = await (client as unknown as { getCurrentPeriod: () => Promise<Period | null> }).getCurrentPeriod();
            if (p?.name) return p;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // best-effort
    }
    return null;
  }

  async getEvaluationsForPeriod(
    period: Period,
    clientId: string,
    kid?: Kid
  ): Promise<Evaluation[]> {
    const cacheKey = kid?.id
      ? `evals:${clientId}:${period.name}:${kid.id}`
      : `evals:${clientId}:${period.name}`;
    return await this.fetchData(
      Capabilities.EVALUATIONS,
      async client => {
        if (!client.getEvaluationsForPeriod) {
          throw new Error("Bad Implementation");
        }
        return await client.getEvaluationsForPeriod(period, kid);
      },
      {
        multiple: false,
        clientId,
        fallback: async () =>
          (await getSimpleCache<Evaluation[]>(cacheKey)) ?? [],
        saveToCache: async (data: Evaluation[]) => {
          await setSimpleCache(cacheKey, data, 300000);
        },
      }
    );
  }

  async getReportForPeriod(
    period: Period,
    clientId: string,
    kid?: Kid
  ): Promise<Report | null> {
    const cacheKey = kid?.id
      ? `report:${clientId}:${period.name}:${kid.id}`
      : `report:${clientId}:${period.name}`;
    return await this.fetchData(
      Capabilities.REPORT,
      async client => {
        if (!client.getReportForPeriod) {
          throw new Error("Bad Implementation");
        }
        return await client.getReportForPeriod(period, kid);
      },
      {
        multiple: false,
        clientId,
        fallback: async () => await getSimpleCache<Report>(cacheKey),
        saveToCache: async (data: Report | null) => {
          await setSimpleCache(cacheKey, data, 300000);
        },
      }
    );
  }

  async getTeachingStaff(
    clientId: string,
    kid?: Kid
  ): Promise<TeachingStaff[]> {
    const cacheKey = `staff:${clientId}`;
    return await this.fetchData(
      Capabilities.TEACHING_STAFF,
      async client => {
        if (!client.getTeachingStaff) {
          throw new Error("Bad Implementation");
        }
        return await client.getTeachingStaff(kid);
      },
      {
        multiple: false,
        clientId,
        fallback: async () =>
          (await getSimpleCache<TeachingStaff[]>(cacheKey)) ?? [],
        saveToCache: async (data: TeachingStaff[]) => {
          await setSimpleCache(cacheKey, data, 300000);
        },
      }
    );
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance[]> {
    return await this.fetchData(
      Capabilities.ATTENDANCE,
      async client => {
        if (!client.getAttendanceForPeriod) {
          throw new Error(
            "getAttendanceForPeriod not implemented but the capability is set."
          );
        }
        const attendance = await client.getAttendanceForPeriod(period);
        return Array.isArray(attendance) ? attendance : [attendance];
      },
      {
        multiple: true,
        fallback: async () => [await getAttendanceFromCache(period)],
        saveToCache: async (data: Attendance[]) => {
          await addAttendanceToDatabase(data, period);
        },
      }
    );
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return await this.fetchData(
      Capabilities.ATTENDANCE_PERIODS,
      async client =>
        client.getAttendancePeriods ? await client.getAttendancePeriods() : [],
      {
        multiple: true,
        fallback: async () => getPeriodsFromCache(),
        saveToCache: async (data: Period[]) => {
          await addPeriodsToDatabase(data);
        },
      }
    );
  }

  async getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_MENU,
      async client =>
        client.getWeeklyCanteenMenu
          ? await client.getWeeklyCanteenMenu(startDate)
          : [],
      {
        multiple: true,
        fallback: async () => getCanteenMenuFromCache(startDate),
        saveToCache: async (data: CanteenMenu[]) => {
          await addCanteenMenuToDatabase(data);
        },
      }
    );
  }

  async getChats(onlyUnread?: boolean): Promise<Chat[]> {
    const wantUnreadOnly = onlyUnread === true;
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client => (client.getChats ? await client.getChats(wantUnreadOnly ? true : undefined) : []),
      {
        multiple: true,
        fallback: async () => getChatsFromCache(),
        ...(wantUnreadOnly
          ? {}
          : {
              saveToCache: async (data: Chat[]) => {
                await addChatsToDatabase(data);
              },
            }),
      }
    );
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client =>
        client.getChatRecipients ? await client.getChatRecipients(chat) : [],
      {
        multiple: true,
        clientId: chat.createdByAccount,
        fallback: async () => getRecipientsFromCache(chat),
        saveToCache: async (data: Recipient[]) => {
          await addRecipientsToDatabase(chat, data);
        },
      }
    );
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client =>
        client.getChatMessages ? await client.getChatMessages(chat) : [],
      {
        multiple: true,
        clientId: chat.createdByAccount,
        fallback: async () => getMessagesFromCache(chat),
        saveToCache: async (data: Message[]) => {
          await addMessagesToDatabase(chat, data);
        },
      }
    );
  }

  async getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client =>
        client.getRecipientsAvailableForNewChat
          ? await client.getRecipientsAvailableForNewChat()
          : [],
      { multiple: true }
    );
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date,
    kidName?: string
  ): Promise<CourseDay[]> {
    return await this.fetchData(
      Capabilities.TIMETABLE,
      async client =>
        client.getWeeklyTimetable
          ? await client.getWeeklyTimetable(weekNumber, date, kidName)
          : [],
      {
        multiple: true,
        fallback: async () => {
          const { getISOWeekYear } = await import("@/utils/services/periods");
          let y = date.getFullYear();
          try {
            y = getISOWeekYear(date).year;
          } catch {}
          return getCoursesFromCache([weekNumber], y);
        },
        saveToCache: async (data: CourseDay[]) => {
          await addCourseDayToDatabase(data);
        },
      }
    );
  }

  async getCourseResources(course: Course): Promise<CourseResource[]> {
    return await this.fetchData(
      Capabilities.TIMETABLE,
      async client =>
        client.getCourseResources
          ? await client.getCourseResources(course)
          : [],
      { multiple: true, clientId: course.createdByAccount }
    );
  }

  async getWeekContents(from: Date, to: Date): Promise<WeekLessonContent[]> {
    const out = await this.fetchData(
      Capabilities.TIMETABLE,
      async client =>
        client.getWeekContents ? await client.getWeekContents(from, to) : [],
      { multiple: true }
    );
    return Array.isArray(out) ? (out as WeekLessonContent[]) : [];
  }

  async sendMessageInChat(chat: Chat, content: string, messageId?: string): Promise<void> {
    try {
      return await this.fetchData(
        Capabilities.CHAT_REPLY,
        async client => {
          if (client.sendMessageInChat) {
            await client.sendMessageInChat(chat, content, messageId);
          }
        },
        { clientId: chat.createdByAccount }
      );
    } catch (e) {
      // Offline-first: enqueue for retry, surface immediately (optimistic).
      try {
        const { enqueueOutbox } = await import("@/services/local/outbox");
        await enqueueOutbox("message-send", {
          chatId: (chat as any)?.id,
          createdByAccount: chat.createdByAccount,
          content,
        });
      } catch {
        // best-effort queue only
      }
      throw e;
    }
  }

  async setNewsAsDone(news: News): Promise<News> {
    try {
      return await this.fetchData(
        Capabilities.NEWS,
        async client =>
          client.setNewsAsAcknowledged
            ? await client.setNewsAsAcknowledged(news)
            : news,
        { multiple: false, clientId: news.createdByAccount }
      );
    } catch (e) {
      try {
        const { enqueueOutbox } = await import("@/services/local/outbox");
        await enqueueOutbox("news-read", {
          newsId: (news as any)?.id,
          createdByAccount: news.createdByAccount,
        });
      } catch {
        // best-effort
      }
      throw e;
    }
  }

  async setHomeworkCompletion(
    homework: Homework,
    state?: boolean
  ): Promise<Homework> {
    try {
      return await this.fetchData(
        Capabilities.HOMEWORK,
        async client =>
          client.setHomeworkCompletion
            ? await client.setHomeworkCompletion(homework, state)
            : homework,
        { multiple: false, clientId: homework.createdByAccount }
      );
    } catch (e) {
      try {
        const { enqueueOutbox } = await import("@/services/local/outbox");
        await enqueueOutbox("homework-done", {
          homeworkId: (homework as any)?.id ?? (homework as any)?.pronoteId,
          createdByAccount: homework.createdByAccount,
          state: state ?? !(homework as any)?.isDone,
        });
      } catch {
        // best-effort
      }
      throw e;
    }
  }

  async createMail(
    accountId: string,
    subject: string,
    content: string,
    recipients: Recipient[],
    cc?: Recipient[],
    bcc?: Recipient[]
  ): Promise<Chat> {
    return await this.fetchData(
      Capabilities.CHAT_CREATE,
      async client => {
        if (client.createMail) {
          return await client.createMail(subject, content, recipients, cc, bcc);
        }
        throw new Error("createMail not implemented");
      },
      { multiple: false, clientId: accountId }
    );
  }

  async getChatParticipants(chat: Chat): Promise<string[]> {
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client =>
        (client as any).getChatParticipants ? await (client as any).getChatParticipants(chat) : [],
      { multiple: true, clientId: chat.createdByAccount }
    );
  }

  async markChatAsRead(chat: Chat, read = true): Promise<void> {
    await this.fetchData(
      Capabilities.CHAT_READ,
      async client => {
        if ((client as any).markChatAsRead) await (client as any).markChatAsRead(chat, read);
      },
      { clientId: chat.createdByAccount }
    );
  }

  async deleteChat(chat: Chat): Promise<void> {
    await this.fetchData(
      Capabilities.CHAT_READ,
      async client => {
        if ((client as any).deleteChat) await (client as any).deleteChat(chat);
      },
      { clientId: chat.createdByAccount }
    );
  }

  async getProfile(): Promise<import("./profile").StudentProfile | null> {
    const out = await this.fetchData(
      Capabilities.PROFILE,
      async client => ((client as any).getProfile ? await (client as any).getProfile() : null),
      { multiple: true }
    );
    if (Array.isArray(out)) {
      return ((out as unknown[]).find(v => v != null) as import("./profile").StudentProfile | undefined) ?? null;
    }
    return (out as any) ?? null;
  }

  async getProfilePicture(): Promise<{ picture: string | null; mime?: string } | null> {
    const out = await this.fetchData(
      Capabilities.PROFILE,
      async client => ((client as any).getProfilePicture ? await (client as any).getProfilePicture() : null),
      { multiple: true }
    );
    if (Array.isArray(out)) {
      const withPicture = (out as unknown[]).find(
        v => v != null && typeof v === "object" && (v as any).picture
      ) as { picture: string | null; mime?: string } | undefined;
      if (withPicture) return withPicture;
      return ((out as unknown[]).find(v => v != null) as { picture: string | null; mime?: string } | undefined) ?? null;
    }
    return (out as any) ?? null;
  }

  async requestQrCode(pin: string): Promise<{ qr: any }> {
    const clients = this.getAvailableClients(Capabilities.PROFILE);
    if (clients.length === 0) {
      throw new Error("No clients available for capability: PROFILE");
    }
    const client = clients[0];
    if (!(client as any).requestQrCode) {
      throw new Error("requestQrCode not supported by client");
    }
    return await (client as any).requestQrCode(pin);
  }

  async getSessionInfo(): Promise<{ start_day: string; week: number; logged_in: boolean; last_connection: string | null } | null> {
    const clients = this.getAvailableClients(Capabilities.PROFILE);
    if (clients.length === 0) return null;
    const client = clients[0];
    if (!(client as any).getSessionInfo) return null;
    try {
      return await (client as any).getSessionInfo();
    } catch {
      return null;
    }
  }

  async getTimetablePdf(day?: Date, portrait?: boolean, overflow?: number): Promise<string | null> {
    const out = await this.fetchData(
      Capabilities.TIMETABLE_PDF,
      async client =>
        (client as any).getTimetablePdf ? await (client as any).getTimetablePdf(day, portrait, overflow) : null,
      { multiple: true }
    );
    // fetchData(multiple:true) renvoie un tableau (un résultat par client).
    // Le callback est scalaire (string|null) : on extrait la 1ère URL non vide.
    if (Array.isArray(out)) {
      for (const v of out) {
        if (typeof v === "string" && v.trim().length > 0) return v;
      }
      return null;
    }
    return (typeof out === "string" && (out as string).trim().length > 0 ? (out as string) : null) ?? null;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_BALANCE,
      async client =>
        client.getCanteenBalances ? await client.getCanteenBalances() : [],
      {
        multiple: true,
        fallback: async () => getBalancesFromCache(),
        saveToCache: async (data: Balance[]) => {
          await addBalancesToDatabase(data);
        },
      }
    );
  }

  async getCanteenTransactionsHistory(
    clientId: string
  ): Promise<CanteenHistoryItem[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_HISTORY,
      async client =>
        client.getCanteenTransactionsHistory
          ? await client.getCanteenTransactionsHistory()
          : [],
      {
        multiple: true,
        clientId,
        fallback: async () => getCanteenTransactionsFromCache(),
        saveToCache: async (data: CanteenHistoryItem[]) => {
          await addCanteenTransactionToDatabase(data);
        },
      }
    );
  }

  async getCanteenQRCodes(clientId: string): Promise<QRCode> {
    return await this.fetchData(
      Capabilities.CANTEEN_QRCODE,
      async client => {
        if (!client.getCanteenQRCodes) {
          throw new Error("getCanteenQRCodes not found");
        }
        return await client.getCanteenQRCodes();
      },
      {
        multiple: false,
        clientId,
      }
    );
  }

  async getCanteenBookingWeek(
    weekNumber: number,
    clientId: string
  ): Promise<BookingDay[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_BOOKINGS,
      async client =>
        client.getCanteenBookingWeek
          ? await client.getCanteenBookingWeek(weekNumber)
          : [],
      {
        multiple: true,
        clientId,
      }
    );
  }

  async setMealAsBooked(meal: Booking, booked?: boolean): Promise<Booking> {
    return await this.fetchData(
      Capabilities.CANTEEN_BOOKINGS,
      async client =>
        client.setMealAsBooked
          ? await client.setMealAsBooked(meal, booked)
          : meal,
      { multiple: false, clientId: meal.createdByAccount }
    );
  }

  clientHasCapatibility(capatibility: Capabilities, clientId: string): boolean {
    const client = this.clients[clientId];
    return !!client?.capabilities.includes(capatibility);
  }

  getAvailableClients(capability: Capabilities): SchoolServicePlugin[] {
    return Object.values(this.clients).filter(client =>
      client.capabilities.includes(capability)
    );
  }

  private async hasInternet(): Promise<boolean> {
    return hasInternetCached();
  }

  private async fetchData<T>(
    capability: Capabilities,
    callback: (client: SchoolServicePlugin) => Promise<T[]>,
    options?: FetchOptions<T[]> & { multiple: true }
  ): Promise<T[]>;

  private async fetchData<T>(
    capability: Capabilities,
    callback: (client: SchoolServicePlugin) => Promise<T>,
    options?: FetchOptions<T> & { multiple?: false }
  ): Promise<T>;

  private async fetchData<T>(
    capability: Capabilities,
    callback: (client: SchoolServicePlugin) => Promise<T | T[]>,
    options?: FetchOptions<T | T[]> & { multiple?: boolean }
  ): Promise<T | T[]> {
    try {
      if (options?.clientId !== undefined) {
        const client = this.clients[options.clientId];
        if (!client) {
          throw new Error("Client ID missing");
        }
        if (!client.capabilities.includes(capability)) {
          throw new Error(
            "Capability " +
              capability +
              " not supported by client " +
              options.clientId
          );
        }
        if (client.requiresInternet !== false && !(await this.hasInternet())) {
          if (options.fallback) {
            return await options.fallback();
          }
          throw new Error("Internet not reachable and no fallback provided.");
        }
        const result = await callback(client);
        if (options.saveToCache) {
          await options.saveToCache(result);
        }
        return result;
      }

      let availableClients = this.getAvailableClients(capability);

      if (!(await this.hasInternet())) {
        availableClients = availableClients.filter(
          client => client.requiresInternet === false
        );
        if (availableClients.length === 0 && options?.fallback) {
          warn("No internet connection, using fallback.");
          return await options.fallback();
        }
      }

      if (availableClients.length === 0) {
        log(
          `No clients available for capability ${capability}, falling back to cache`
        );
        if (options?.fallback) {
          return await options.fallback();
        }
        throw new Error(`No clients available for capability: ${capability}`);
      }

      if (options?.multiple) {
        const results = await Promise.all(
          availableClients.map(client => callback(client) as Promise<T[]>)
        );
        const combinedResult = results.flat();

        if (options?.saveToCache) {
          await options.saveToCache(combinedResult);
        }

        return combinedResult;
      }
    } catch (e) {
      if (options?.fallback) {
        return await options.fallback();
      }
      throw e;
    }

    throw new Error(
      "fetchData misuse: non-multiple call for capability " +
        capability +
        " without clientId must specify clientId or use multiple:true"
    );
  }

  private getServicePluginForAccount(
    service: ServiceAccount
  ): SchoolServicePlugin {
    if (service.serviceId === Services.PRONOTE) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/pronote/index");
      return new module.Pronote(service.id);
    }

    if (service.serviceId === Services.MOCK_DATA) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/mock/index");
      return new module.MockData(service.id);
    }

    error(
      "We're not able to find a plugin for service: " +
        service.serviceId +
        ". Please review your implementation",
      "AccountManager.getServicePluginForAccount"
    );
    throw new Error("Unsupported service: " + String(service?.serviceId));
  }
}

let globalManager: AccountManager | null = null;
let globalManagerAccountId: string | null = null;
let initInFlight: Promise<AccountManager> | null = null;
let initInFlightAccountId: string | null = null;
const managerListeners: Array<(manager: AccountManager) => void> = [];

export const subscribeManagerUpdate = (
  listener: (manager: AccountManager) => void
) => {
  managerListeners.push(listener);
  if (globalManager) {
    listener(globalManager);
  }
  return () => {
    const idx = managerListeners.indexOf(listener);
    if (idx !== -1) {
      managerListeners.splice(idx, 1);
    }
  };
};

const notifyManagerListeners = (manager: AccountManager) => {
  managerListeners.forEach(listener => listener(manager));
};

export const initializeAccountManager = async (
  accountId?: string
): Promise<AccountManager> => {
  // Déduplique les inits concurrents : 2 refresh simultanés brûleraient
  // 2 fois le même token Pronote à usage unique (le 2e échoue à coup sûr).
  if (initInFlight && initInFlightAccountId === accountId) return initInFlight;
  initInFlightAccountId = accountId ?? null;
  initInFlight = (async (): Promise<AccountManager> => {
    if (!accountId) {
      const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
      if (!lastUsedAccount) {
        throw new Error(
          "No account ID provided and no last used account found."
        );
      }
      accountId = lastUsedAccount;
    }
    const account = useAccountStore
      .getState()
      .accounts.find(acc => acc.id === accountId);

    if (!account) {
      throw new Error("Account not found for ID: " + accountId);
    }

    const manager = new AccountManager(account);
    await manager.refreshAllAccounts();
    globalManager = manager;
    globalManagerAccountId = account.id;
    notifyManagerListeners(manager);
    return manager;
  })();
  try {
    return await initInFlight;
  } finally {
    initInFlight = null;
    initInFlightAccountId = null;
  }
};

export const getManager = (): AccountManager | null => {
  // Le manager est scopé au compte : après un changement de compte (démo ->
  // réel, switch, suppression), l'ancien manager (ex. mocks) ne doit jamais
  // resservir. Les appelants ré-initialisent via initializeAccountManager.
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  if (!globalManager || globalManagerAccountId !== lastUsedAccount) {
    if (
      globalManagerAccountId !== null &&
      globalManagerAccountId !== lastUsedAccount
    ) {
      globalManager = null;
      globalManagerAccountId = null;
    } else {
      warn(
        "Account manager not initialized. Call initializeAccountManager first."
      );
    }
    return null;
  }
  return globalManager;
};
