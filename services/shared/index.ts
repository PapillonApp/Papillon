import * as Network from "expo-network";

import { addAttendanceToDatabase, getAttendanceFromCache } from "@/database/useAttendance";
import { addCanteenMenuToDatabase, addCanteenTransactionToDatabase, getCanteenMenuFromCache, getCanteenTransactionsFromCache } from "@/database/useCanteen";
import { addChatsToDatabase, addMessagesToDatabase, addRecipientsToDatabase, getChatsFromCache, getMessagesFromCache, getRecipientsFromCache } from "@/database/useChat";
import { addPeriodGradesToDatabase, addPeriodsToDatabase, getGradePeriodsFromCache, getPeriodsFromCache } from "@/database/useGrades";
import { addHomeworkToDatabase, getHomeworksFromCache } from "@/database/useHomework";
import { addKidToDatabase, getKidsFromCache } from "@/database/useKids";
import { addNewsToDatabase, getNewsFromCache } from "@/database/useNews";
import { addCourseDayToDatabase, getCoursesFromCache } from "@/database/useTimetable";
import { Attendance } from "@/services/shared/attendance";
import { Booking, BookingDay, CanteenHistoryItem, CanteenMenu, QRCode } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import {
  Capabilities,
  FetchOptions,
  SchoolServicePlugin,
} from "@/services/shared/types";
import { useAccountStore } from "@/stores/account";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { error, log, warn } from "@/utils/logger/logger";

import { Kid } from "./kid";
import { Balance } from "./balance";
import { addBalancesToDatabase, getBalancesFromCache } from "@/database/useBalance";

export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(readonly account: Account) {}

	getAccount(): Account {
		return this.account
	}

  async refreshAllAccounts(): Promise<boolean> {
    log("We're refreshing all services for the account " + this.account.id);

    this.handleHasInternet();

    let refreshedAtLeastOne = false;

    for (const service of this.account.services) {
      try {
        log("Trying to refresh " + service.id);
        const plugin = this.getServicePluginForAccount(service);

        if (plugin?.capabilities.includes(Capabilities.REFRESH)) {
          this.clients[service.id] = await plugin.refreshAccount(service.auth);
          refreshedAtLeastOne = true;
          log("Successfully refreshed " + service.id);
        } else {
          this.clients[service.id] = plugin;
          log("Plugin for " + service.id + " doesn't support refresh but is available for other capabilities");
        }
      } catch (e) {
        error(
          `Failed to refresh account for service ${service.serviceId}: ${e}`,
          "AccountManager.refreshAllAccounts"
        );
      }
    }

    log(
      "Finished refreshing process for all services, services refreshed: " +
        Object.keys(this.clients).length
    );
    return refreshedAtLeastOne;
  }

  async getKids(): Promise<Kid[]> {
    return await this.fetchData(
      Capabilities.HAVE_KIDS,
      async client =>
        client.getKids ? client.getKids() : [],
      {
        multiple: true,
        fallback: async () => getKidsFromCache(),
        saveToCache: async(data: Kid[]) => {
          await addKidToDatabase(data);
        }
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
        }
      }
    );
  }


    async getGradesForPeriod(period: Period, clientId: string, kid?: Kid): Promise<PeriodGrades> {
      return await this.fetchData(
        Capabilities.GRADES,
        async client =>
          client.getGradesForPeriod ? await client.getGradesForPeriod(period, kid) : error("Bad Implementation"),
        { 
          multiple: false,
          clientId,
          fallback: async () => getGradePeriodsFromCache(period.name),
          saveToCache: async (data: PeriodGrades) => {
            await addPeriodGradesToDatabase(data, period.name);
          }
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
        }
      }
    );
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance[]> {
    return await this.fetchData(
      Capabilities.ATTENDANCE, async client => {
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
        }
      });
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return await this.fetchData(
      Capabilities.ATTENDANCE_PERIODS,
      async client =>
        client.getAttendancePeriods ? await client.getAttendancePeriods() : [],
      { 
        multiple: true,
        fallback: async () => getPeriodsFromCache(),
        saveToCache: async (data: Period[]) =>  {
          await addPeriodsToDatabase(data)
        }
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
        }
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
          await addChatsToDatabase(data)
        }
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
          await addRecipientsToDatabase(chat, data)
        }
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
          await addMessagesToDatabase(chat, data)
        }
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

  async getWeeklyTimetable(weekNumber: number): Promise<CourseDay[]> {
    return await this.fetchData(
      Capabilities.TIMETABLE,
      async client =>
        client.getWeeklyTimetable ? await client.getWeeklyTimetable(weekNumber) : [],
      {
        multiple: true,
        fallback: async () => getCoursesFromCache(weekNumber),
        saveToCache: async (data: CourseDay[]) => {
          addCourseDayToDatabase(data)
        }
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
    return await this.fetchData(Capabilities.NEWS, async client =>
      client.setNewsAsAcknowledged
        ? await client.setNewsAsAcknowledged(news)
        : news,
    { multiple: false, clientId: news.createdByAccount }
    );
  }

  async setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    return await this.fetchData(Capabilities.HOMEWORK, async client =>
      client.setHomeworkCompletion
        ? await client.setHomeworkCompletion(homework, state)
        : homework,
    { multiple: false, clientId: homework.createdByAccount }
    );
  }

  async createMail(accountId: string, subject: string, content: string, recipients: Recipient[], cc?: Recipient[], bcc?: Recipient[]): Promise<Chat> {
    return await this.fetchData(
      Capabilities.CHAT_CREATE,
      async client => {
        if (client.createMail) {
          return await client.createMail(subject, content, recipients, cc, bcc)
        } 
        throw new Error("createMail not implemented")
        
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
				fallback: async () => getBalancesFromCache(),
				saveToCache: async (data: Balance[]) => {
					await addBalancesToDatabase(data)
				}
      }
    );
  }

  async getCanteenTransactionsHistory(clientId: string): Promise<CanteenHistoryItem[]> {
    return await this.fetchData(
      Capabilities.CANTEEN_HISTORY,
      async client =>
        client.getCanteenTransactionsHistory ? await client.getCanteenTransactionsHistory() : [],
      {
        multiple: true,
        clientId,
        fallback: async () => getCanteenTransactionsFromCache(),
        saveToCache: async (data: CanteenHistoryItem[]) => {
          await addCanteenTransactionToDatabase(data)
        }
      }
    )
  }

	async getCanteenQRCodes(clientId: string): Promise<QRCode> {
		return await this.fetchData(
			Capabilities.CANTEEN_QRCODE,
			async client =>
				client.getCanteenQRCodes ? await client.getCanteenQRCodes() : error("getCanteenQRCodes not found"),
			{
				multiple: false,
        clientId
			}
		)
	}

	async getCanteenBookingWeek(weekNumber: number, clientId: string): Promise<BookingDay[]> {
		return await this.fetchData(
			Capabilities.CANTEEN_BOOKINGS,
			async client =>
				client.getCanteenBookingWeek ? await client.getCanteenBookingWeek(weekNumber) : [],
			{
				multiple: true,
        clientId
			}
		)
	}

  async setMealAsBooked(meal: Booking, booked?: boolean): Promise<Booking> {
    return await this.fetchData(Capabilities.CANTEEN_BOOKINGS, async client =>
      client.setMealAsBooked
        ? await client.setMealAsBooked(meal, booked)
        : meal,
    	{ multiple: false, clientId: meal.createdByAccount }
    );
  }

  clientHasCapatibility(capatibility: Capabilities, clientId: string): boolean {
    const client = this.clients[clientId]
    if (client?.capabilities.includes(capatibility)) {
      return true;
    }
    return false;
  }

  getAvailableClients(capability: Capabilities): SchoolServicePlugin[] {
    return Object.values(this.clients).filter(client =>
      client.capabilities.includes(capability)
    );
  }

  private async handleHasInternet<T>(options?: FetchOptions<T | T[]>): Promise<T | T[] | void> {
    const networkState = await Network.getNetworkStateAsync();
    const hasInternet = networkState.isInternetReachable ?? false;
    if (!hasInternet) {
      warn("No internet connection, using fallback if available.");
      if (options?.fallback) {
        return await options.fallback();
      }
      throw new Error("Internet not reachable and no fallback provided.");
    }
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
    const resultFromFallback = await this.handleHasInternet<T>(options);
    if (resultFromFallback !== undefined) {
      return resultFromFallback;
    }
    try {
      if (options?.clientId !== undefined) {
        const client = this.clients[options.clientId];
        if (!client) {
          error("Client ID missing");
        }
        if (!client.capabilities.includes(capability)) {
          error(
            "Capability " +
              capability +
              " not supported by client " +
              options.clientId
          );
        }
        const result = await callback(client);
        if (options.saveToCache) {
          await options.saveToCache(result);
        }
        return result;
      }

      const availableClients = this.getAvailableClients(capability);
      
      log(`Available clients for capability ${capability}: ${availableClients.length}`);
      if (availableClients.length === 0) {
        log(`No clients available for capability ${capability}, falling back to cache`);
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

    error("We're not able to find a plugin for service: " + service.serviceId + ". Please review your implementation", "AccountManager.getServicePluginForAccount");
  }
}


let globalManager: AccountManager | null = null;
const managerListeners: Array<(manager: AccountManager) => void> = [];

export const subscribeManagerUpdate = (listener: (manager: AccountManager) => void) => {
  managerListeners.push(listener);
  if (globalManager) listener(globalManager);
  return () => {
    const idx = managerListeners.indexOf(listener);
    if (idx !== -1) managerListeners.splice(idx, 1);
  };
};

const notifyManagerListeners = (manager: AccountManager) => {
  managerListeners.forEach(listener => listener(manager));
};

export const initializeAccountManager = async (accountId?: string): Promise<AccountManager> => {
  if (!accountId) {
    const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
    if (!lastUsedAccount) {
      error("No account ID provided and no last used account found.");
    }
    accountId = lastUsedAccount;
  }
  const account = useAccountStore.getState().accounts.find(acc => acc.id === accountId);
  
  if (!account) {
    error("Account not found for ID: " + accountId);
  }

  const manager = new AccountManager(account);
  await manager.refreshAllAccounts();
  globalManager = manager;
  notifyManagerListeners(manager);
  return manager;
};

export const getManager = (): AccountManager => {
  if (!globalManager) {
    warn("Account manager not initialized. Call initializeAccountManager first.");
  }
  return globalManager;
};
