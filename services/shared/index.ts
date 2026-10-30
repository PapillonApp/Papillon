import * as Network from "expo-network";

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
  cachePeriodGrades,
  addPeriodsToDatabase,
  getCachedPeriodGrades,
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
  CanteenMenu,
  QRCode,
} from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import {
  Capabilities,
  FetchOptions,
  SchoolServicePlugin,
  ServiceFailure,
} from "@/services/shared/types";
import { useAccountStore } from "@/stores/account";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { debug, error, log, warn } from "@/utils/logger/logger";

import { allowAuthRetry, getAuthState, pruneAuthStates } from "../auth/coordinator";
import { classifyAuthError } from "../auth/errors";
import { needsUserAction } from "../auth/policy";
import { AuthFailureReason, AuthStep } from "../auth/types";
import { AuthenticationError } from "../errors/AuthenticationError";
import { SecurityChallengeError } from "../errors/SecurityChallengeError";
import { ServiceUnavailableError } from "../errors/ServiceUnavailableError";
import { Balance } from "./balance";
import { Kid } from "./kid";

export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};
  private failures = new Map<Capabilities, ServiceFailure[]>();

  getFailures(capability: Capabilities): ServiceFailure[] {
    return this.failures.get(capability) ?? [];
  }

  constructor(public account: Account) {}

  syncAccount(account: Account): void {
    this.account = account;
    for (const id of Object.keys(this.clients)) {
      if (!account.services.some(service => service.id === id)) {
        delete this.clients[id];
      }
    }
  }

  removeService(id: string): void {
    delete this.clients[id];
  }

  getAccount(): Account {
    return this.account;
  }

  /**
   * The persisted reason wins over the error: only it knows that a rejection
   * followed an interrupted rotation (credential_lost).
   */
  private failureReason(service: ServiceAccount, err: unknown): AuthFailureReason {
    const state = getAuthState(service.id);
    if (state?.step === AuthStep.Failed && state.failure) {
      return state.failure.reason;
    }
    return classifyAuthError(err);
  }

  /**
   * @param options.force - Explicit retry from the user: lifts a pending
   * backoff or a block left by a rejected credential.
   */
  async refreshAllAccounts(options: { force?: boolean } = {}): Promise<boolean> {
    debug("We're refreshing all services for the account " + this.account.id);
    const hasInternet = await this.hasInternet();

    let refreshedAtLeastOne = false;

    const failures: Array<{ service: ServiceAccount; err: unknown; reason: AuthFailureReason }> = [];

    for (const service of this.account.services) {
      try {
        debug("Trying to refresh " + service.id);
        // Plugins that know when their session ends keep their instance, so
        // a renewal already running inside it is joined, not duplicated.
        const existing = this.clients[service.id];
        const reusable = existing?.isTokenValid ? existing : undefined;
        const plugin = reusable ?? this.getServicePluginForAccount(service);

        if (!hasInternet && plugin.requiresInternet !== false) {
          warn(`Skipping network service ${service.id} while offline.`);
          continue;
        }

        if (reusable?.isTokenValid?.()) {
          refreshedAtLeastOne = true;
          debug("Reusing the still valid session of " + service.id);
          continue;
        }

        if (plugin?.capabilities.includes(Capabilities.REFRESH)) {
          if (options.force) {
            allowAuthRetry(service.id);
          }
          this.clients[service.id] = await plugin.refreshAccount(service.auth);
          refreshedAtLeastOne = true;
          debug("Successfully refreshed " + service.id);
        } else {
          this.clients[service.id] = plugin;
          debug(
            "Plugin for " +
              service.id +
              " doesn't support refresh but is available for other capabilities"
          );
        }
      } catch (e) {
        const reason = this.failureReason(service, e);
        warn(`Refresh failed for ${service.id} (${reason}): ${e}`);
        failures.push({ service, err: e, reason });
      }
    }

    debug(
      "Finished refreshing process for all services, services refreshed: " +
        Object.keys(this.clients).length
    );

    const challenge = failures.find(f => f.err instanceof SecurityChallengeError);
    if (challenge) {
      const err = challenge.err as SecurityChallengeError;
      throw new SecurityChallengeError(
        err.securityError,
        err.session,
        err.deviceUUID,
        challenge.service
      );
    }

    // A challenge the app can solve was handled above: any other needs a relink.
    const authFailure = failures.find(f => needsUserAction(f.reason));
    if (authFailure) {
      throw new AuthenticationError(String(authFailure.err), authFailure.service, authFailure.reason);
    }

    if (!hasInternet && Object.keys(this.clients).length === 0 && this.account.services.length > 0) {
      throw new Error("Internet not reachable and no offline service is available.");
    }

    if (!refreshedAtLeastOne && failures.length > 0) {
      throw new ServiceUnavailableError(String(failures[0].err), failures[0].service, failures[0].reason);
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

  async getNews(): Promise<News[]> {
    return await this.fetchData(
      Capabilities.NEWS,
      async client => (client.getNews ? await client.getNews() : []),
      {
        multiple: true,
        fallback: async () => getNewsFromCache(),
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
      async client =>
        client.getGradesForPeriod
          ? await client.getGradesForPeriod(period, kid)
          : error("Bad Implementation"),
      {
        multiple: false,
        clientId,
        fallback: async () => getCachedPeriodGrades(`${clientId}:${kid?.id ?? ""}:${period.name}`),
        saveToCache: async (data: PeriodGrades) => {
          cachePeriodGrades(data, `${clientId}:${kid?.id ?? ""}:${period.name}`);
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

  async getChats(): Promise<Chat[]> {
    return await this.fetchData(
      Capabilities.CHAT_READ,
      async client => (client.getChats ? await client.getChats() : []),
      {
        multiple: true,
        fallback: async () => getChatsFromCache(),
        saveToCache: async (data: Chat[]) => {
          await addChatsToDatabase(data);
        },
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

  async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    return await this.fetchData(
      Capabilities.TIMETABLE,
      async client =>
        client.getWeeklyTimetable
          ? await client.getWeeklyTimetable(weekNumber, date)
          : [],
      {
        multiple: true,
        fallback: async () => getCoursesFromCache([weekNumber], date.getFullYear()),
        saveToCache: async (data: CourseDay[]) => {
          addCourseDayToDatabase(data);
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

  async sendMessageInChat(chat: Chat, content: string): Promise<void> {
    return await this.fetchData(
      Capabilities.CHAT_REPLY,
      async client => {
        if (client.sendMessageInChat) {
          await client.sendMessageInChat(chat, content);
        }
      },
      { clientId: chat.createdByAccount }
    );
  }

  async setNewsAsDone(news: News): Promise<News> {
    return await this.fetchData(
      Capabilities.NEWS,
      async client =>
        client.setNewsAsAcknowledged
          ? await client.setNewsAsAcknowledged(news)
          : news,
      { multiple: false, clientId: news.createdByAccount }
    );
  }

  async setHomeworkCompletion(
    homework: Homework,
    state?: boolean
  ): Promise<Homework> {
    return await this.fetchData(
      Capabilities.HOMEWORK,
      async client =>
        client.setHomeworkCompletion
          ? await client.setHomeworkCompletion(homework, state)
          : homework,
      { multiple: false, clientId: homework.createdByAccount }
    );
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

  async getCanteenBalances(): Promise<Balance[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_BALANCE,
      async client =>
        client.getCanteenBalances ? await client.getCanteenBalances() : [],
      {
        multiple: true,
        // The cache holds every account's cards: keep this account's only.
        fallback: async () => (await getBalancesFromCache()).filter(balance => this.account.services.some(service => service.id === balance.createdByAccount)),
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
      async client =>
        client.getCanteenQRCodes
          ? await client.getCanteenQRCodes()
          : error("getCanteenQRCodes not found"),
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
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isInternetReachable ?? false;
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
    const callFallback = async (): Promise<T | T[]> => {
      const fallbackResult = await options!.fallback!();
      if (options?.multiple && Array.isArray(fallbackResult)) {
        return fallbackResult.filter(
          (item): item is T => item !== null && item !== undefined
        );
      }
      return fallbackResult;
    };

    const failures: ServiceFailure[] = [];

    const noteFailure = (client: SchoolServicePlugin, reason: unknown) => {
      warn(
        `[${client.displayName}] capability ${capability}: ${String(reason)}`,
        "fetchData"
      );
      failures.push({
        service: client.service,
        displayName: client.displayName,
        capability,
        reason,
        at: new Date(),
      });
    };

    try {
      if (options?.clientId !== undefined) {
        const client = this.clients[options.clientId];
        // Expected while the manager is published before its first refresh.
        if (!client) {
          if (options.fallback) {
            return await callFallback();
          }
          throw new Error(`Client ${options.clientId} is not available yet`);
        }
        if (!client.capabilities.includes(capability)) {
          throw error(
            "Capability " +
              capability +
              " not supported by client " +
              options.clientId
          );
        }
        if (client.requiresInternet !== false && !(await this.hasInternet())) {
          if (options.fallback) {
            return await callFallback();
          }
          throw new Error("Internet not reachable and no fallback provided.");
        }
        let result: T | T[];
        try {
          result = await callback(client);
        } catch (e) {
          noteFailure(client, e);
          throw e;
        }
        if (options.saveToCache) {
          await options.saveToCache(result);
        }
        return result;
      }

      let availableClients = this.getAvailableClients(capability);

      if (!(await this.hasInternet())) {
        availableClients = availableClients.filter(client => client.requiresInternet === false);
        if (availableClients.length === 0 && options?.fallback) {
          warn("No internet connection, using fallback.");
          return await callFallback();
        }
      }

      if (availableClients.length === 0) {
        log(
          `No clients available for capability ${capability}, falling back to cache`
        );
        if (options?.fallback) {
          return await callFallback();
        }
        throw new Error(`No clients available for capability: ${capability}`);
      }

      if (options?.multiple) {
        const settled = await Promise.allSettled(
          availableClients.map(client => callback(client) as Promise<T[]>)
        );

        settled.forEach((result, index) => {
          if (result.status === "rejected") {
            noteFailure(availableClients[index], result.reason);
          }
        });

        const combinedResult = settled.flatMap(result =>
          result.status === "fulfilled" ? result.value : []
        );

        if (options?.saveToCache && failures.length === 0) {
          await options.saveToCache(combinedResult);
        }

        return combinedResult;
      }
    } catch (e) {
      warn(`capability ${capability} failed: ${String(e)}`, "fetchData");
      if (options?.fallback) {
        return await callFallback();
      }
      throw e;
    } finally {
      this.failures.set(capability, failures);
    }

    error(
      "An error occurred while fetching data for capability: " + capability
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

    if (service.serviceId === Services.CAHIER_DE_PREPA) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/cahierDePrepa/index");
      return new module.CahierDePrepa(service.id);
    }

    if (service.serviceId === Services.SKOLENGO) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/skolengo/index");
      return new module.Skolengo(service.id);
    }

    if (service.serviceId === Services.ECOLEDIRECTE) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/ecoledirecte/index");
      return new module.EcoleDirecte(service.id);
    }

    if (service.serviceId === Services.MULTI) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/multi/index");
      return new module.Multi(service.id);
    }

    if (service.serviceId === Services.TURBOSELF) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/turboself/index");
      return new module.TurboSelf(service.id);
    }

    if (service.serviceId === Services.ARD) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/ard/index");
      return new module.ARD(service.id);
    }

    if (service.serviceId === Services.IZLY) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/izly/index");
      return new module.Izly(service.id);
    }

    if (service.serviceId === Services.ALISE) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/alise/index");
      return new module.Alise(service.id);
    }

    if (service.serviceId === Services.APPSCHO) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require("@/services/appscho/index");
      return new module.Appscho(service.id);
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
  }
}

let globalManager: AccountManager | null = null;
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

const managerInFlight = new Map<string, Promise<AccountManager>>();

export const initializeAccountManager = async (
  accountId?: string,
  options: { force?: boolean } = {}
): Promise<AccountManager> => {
  if (!accountId) {
    const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
    if (!lastUsedAccount) {
      // Expected with no account (e.g. app resumed before onboarding): callers catch it, don't report.
      throw new Error("No account ID provided and no last used account found.");
    }
    accountId = lastUsedAccount;
  }

  const pending = managerInFlight.get(accountId);
  if (pending) {
    if (!options.force) {
      debug("An initialization is already running for " + accountId + ", joining it.");
      return pending;
    }
    // Joining would skip the retry the user asked for: wait, then run again.
    await pending.catch(() => undefined);
  }

  const targetId = accountId;

  const task = (async () => {
    const account = useAccountStore
      .getState()
      .accounts.find(acc => acc.id === targetId);

    if (!account) {
      throw error("Account not found for ID: " + targetId);
    }

    pruneAuthStates(
      useAccountStore.getState().accounts.flatMap(acc => acc.services.map(service => service.id))
    );

    let manager = globalManager;
    if (manager && manager.account.id === targetId) {
      manager.syncAccount(account);
    } else {
      manager = new AccountManager(account);
      // Published before the network refresh: with no clients yet, every
      // fetch falls back to the local cache, so screens render the last
      // known data instantly and get the fresh one on the notify below.
      globalManager = manager;
      notifyManagerListeners(manager);
    }

    await manager.refreshAllAccounts(options);
    // A newer initialization for another account may have taken over while this
    // one was refreshing; publishing now would hand screens the stale account.
    if (globalManager === manager) {
      notifyManagerListeners(manager);
    }
    return manager;
  })();

  managerInFlight.set(targetId, task);

  try {
    return await task;
  } finally {
    managerInFlight.delete(targetId);
  }
};

export const getManager = (silent = false): AccountManager => {
  if (!globalManager && !silent) {
    warn(
      "Account manager not initialized. Call initializeAccountManager first."
    );
  }
  return globalManager;
};
