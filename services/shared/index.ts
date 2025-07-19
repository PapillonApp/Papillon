import * as Network from "expo-network";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import { News } from "@/services/shared/news";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";

export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(private account: Account) {}

  async refreshAllAccounts(): Promise<Pronote | undefined> {
    if (this.hasInternetConnection()) {
      for (const service of this.account.services) {
        const plugin = this.getServicePluginForAccount(service);
        if (plugin && plugin.capabilities.includes(Capabilities.REFRESH)) {
          const client = await plugin.refreshAccount(service.auth);
          this.clients[service.serviceId] = client;
          return client;
        }

        error(
          "Unable to find the plugin for this ServiceAccount: " +
            service.serviceId,
          "AccountManager.refreshAllAccounts"
        );
      }
    }

    error(
      "Your device is not connected to the internet, please check your connection.",
      "AccountManager.refreshAllAccounts"
    );
  }

  async getHomeworks(date: Date): Promise<Homework[]> {
    return (await this.fetchData<Homework[]>(
      Capabilities.HOMEWORK,
      async client => client.getHomeworks ? await client.getHomeworks(date) : [],
      { multiple: true }
    )) as Homework[];
  }

  async getNews(): Promise<News[]> {
    return (await this.fetchData<News[]>(
      Capabilities.NEWS,
      async client => client.getNews ? await client.getNews() : [],
      { multiple: true }
    )) as News[];
  }

  async getGradesForPeriod(period: string): Promise<PeriodGrades> {
    return (await this.fetchData<PeriodGrades>(
      Capabilities.GRADES,
      async client => client.getGradesForPeriod ? await client.getGradesForPeriod(period) : error("getGradesForPeriod not implemented but the capability is set."),
      { multiple: false }
    )) as PeriodGrades;
  }

  async getGradesPeriods(): Promise<Period[]> {
    return (await this.fetchData<Period[]>(
      Capabilities.GRADES,
      async client => client.getGradesPeriods ? await client.getGradesPeriods() : [],
      { multiple: true }
    )) as Period[];
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance> {
    return (await this.fetchData<Attendance>(
      Capabilities.ATTENDANCE,
      async client => client.getAttendanceForPeriod ? await client.getAttendanceForPeriod(period) : error("getAllAttendanceForPeriod not implemented but the capability is set."),
      { multiple: false }
    )) as Attendance;
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return (await this.fetchData<Period[]>(
      Capabilities.ATTENDANCE,
      async client => client.getAttendancePeriods ? await client.getAttendancePeriods() : [],
      { multiple: true }
    )) as Period[];
  }

  async getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    return (await this.fetchData<CanteenMenu[]>(
      Capabilities.CANTEEN_MENU,
      async client => client.getWeeklyCanteenMenu ? await client.getWeeklyCanteenMenu(startDate) : [],
      { multiple: true }
    )) as CanteenMenu[];
  }

  async getChats(): Promise<Chat[]> {
    return (await this.fetchData<Chat[]>(
      Capabilities.CHAT_READ,
      async client => client.getChats ? await client.getChats() : [],
      { multiple: true }
    )) as Chat[];
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    return (await this.fetchData<Recipient[]>(
      Capabilities.CHAT_READ,
      async client => client.getChatRecipients ? await client.getChatRecipients(chat) : [],
      { multiple: true, clientId: chat.createdByAccount }
    )) as Recipient[];
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    return (await this.fetchData<Message[]>(
      Capabilities.CHAT_READ,
      async client => client.getChatMessages ? await client.getChatMessages(chat) : [],
      { multiple: true, clientId: chat.createdByAccount }
    )) as Message[];
  }

  async getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    return (await this.fetchData<Recipient[]>(
      Capabilities.CHAT_READ,
      async client => client.getRecipientsAvailableForNewChat ? await client.getRecipientsAvailableForNewChat() : [],
      { multiple: true }
    )) as Recipient[];
  }

  async sendMessageInChat(chat: Chat, content: string): Promise<void> {
    await this.fetchData<void>(
      Capabilities.CHAT_WRITE,
      async client => {
        if (client.sendMessageInChat) {
          await client.sendMessageInChat(chat, content);
        }
      },
      { multiple: true, clientId: chat.createdByAccount }
    );
  }

  async setNewsAsDone(news: News): Promise<News> {
    return (await this.fetchData<News>(
      Capabilities.NEWS,
      async client => client.setNewsAsAcknowledged ? await client.setNewsAsAcknowledged(news) : news,
      { multiple: false }
    )) as News;
  }

  private hasInternetConnection(): boolean {
    const networkState = Network.useNetworkState();
    return networkState.isInternetReachable ?? false;
  }

  private getAvailableClients(
    capatibility: Capabilities
  ): SchoolServicePlugin[] {
    const clients: SchoolServicePlugin[] = [];
    for (const client of Object.values(this.clients)) {
      if (client.capabilities.includes(capatibility)) {
        clients.push(client);
      }
    }

    return clients;
  }

  private async fetchData<T>(
    capability: Capabilities,
    callback: (client: SchoolServicePlugin) => Promise<T>,
    options?: { multiple?: boolean, clientId?: string }
  ): Promise<T | T[] | undefined> {
    if (!this.hasInternetConnection()) {
      error("Internet not reachable.");
    }

    if (options?.clientId !== undefined) {
      const client = this.clients[options.clientId];
      if (!client) {
        error(`Client with ID ${options.clientId} not found.`);
      }
      if (!client.capabilities.includes(capability)) {
        error(`Client with ID ${options.clientId} does not support capability ${capability}.`);
      }
      return await callback(client);
    }

    const availableClients = this.getAvailableClients(capability);

    if (options?.multiple) {
      const results: T[] = [];
      for (const client of availableClients) {
        results.push(...((await callback(client)) as T[]));
      }
      return results;
    }

    for (const client of availableClients) {
      return await callback(client);
    }

    return options?.multiple ? [] : undefined;
  }

  private getServicePluginForAccount(
    service: ServiceAccount
  ): SchoolServicePlugin | null {
    switch (service.serviceId) {
      case Services.PRONOTE:
        return new (require("@/services/pronote/index").Pronote)(service.id);
      default:
        console.warn(`Service plugin for ${service} not implemented.`);
        return null;
    }
  }
}