import * as Network from "expo-network";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import { News } from "@/services/shared/news";

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
    return undefined;
  }

  async getAllHomeworks(date: Date): Promise<Array<Homework>> {
    return (await this.fetchData<Homework[]>(
      Capabilities.HOMEWORK,
      async client => client.getHomeworks ? await client.getHomeworks(date) : [],
      { multiple: true }
    )) as Homework[];
  }

  async getAllNews(): Promise<Array<News>> {
    return (await this.fetchData<News[]>(
      Capabilities.NEWS,
      async client => client.getNews ? await client.getNews() : [],
      { multiple: true }
    )) as News[];
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
  ): Array<SchoolServicePlugin> {
    const clients: Array<SchoolServicePlugin> = [];
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
    options?: { multiple?: boolean }
  ): Promise<T | T[] | undefined> {
    if (!this.hasInternetConnection()) {
      error("Internet not reachable.");
      return options?.multiple ? [] : undefined;
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