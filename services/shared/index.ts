import * as Network from "expo-network";

import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { error, log, warn } from "@/utils/logger/logger";
import { News } from "@/services/shared/news";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";

export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(private account: Account) {}

  async refreshAllAccounts(): Promise<boolean> {
    log("We're refreshing all services for the account " + this.account.id);

    if (!(await this.hasInternetConnection())) {
      error(
        "Your device is not connected to the internet.",
        "AccountManager.refreshAllAccounts"
      );
    }

    let refreshedAtLeastOne = false;

    for (const service of this.account.services) {
      try {
        log("Trying to refresh " + service.id);
        const plugin = this.getServicePluginForAccount(service);

        if (plugin && plugin.capabilities.includes(Capabilities.REFRESH)) {
          const client = await plugin.refreshAccount(service.auth);
          this.clients[service.id] = client;
          refreshedAtLeastOne = true;
          log("Successfully refreshed " + service.id);
        } else {
          error(
            `Plugin not found or REFRESH capability missing for service: ${service.serviceId}`,
            "AccountManager.refreshAllAccounts"
          );
        }
      } catch (e) {
        error(
          `Failed to refresh account for service ${service.serviceId}: ${e}`,
          "AccountManager.refreshAllAccounts"
        );
      }
    }

    log("Finished refreshing process for all services, services refreshed: " + Object.keys(this.clients).length);
    return refreshedAtLeastOne;
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

  async getWeeklyTimetable(date: Date): Promise<CourseDay[]> {
    return (await this.fetchData<CourseDay[]>(
      Capabilities.TIMETABLE,
      async client => client.getWeeklyTimetable ? await client.getWeeklyTimetable(date) : [],
      { multiple: true }
    )) as CourseDay[];
  }

  async getCourseResources(course: Course): Promise<CourseResource[]> {
    return (await this.fetchData<CourseResource[]>(
      Capabilities.TIMETABLE,
      async client => client.getCourseResources ? await client.getCourseResources(course) : [],
      { multiple: true, clientId: course.createdByAccount }
    )) as CourseResource[];
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

  private async hasInternetConnection(): Promise<boolean> {
    const networkState = await Network.getNetworkStateAsync();
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
      const results = await Promise.all(
        availableClients.map(client => callback(client) as Promise<T[]>)
      );

      return results.flat();
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
    { const pronoteModule = require("@/services/pronote/index");
      const plugin = new pronoteModule.Pronote(service.id);
      return plugin;
    }

    default:
      warn(`Service plugin for ${service.serviceId} not implemented.`);
      return null;
    }
  }
}