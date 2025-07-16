import * as Network from "expo-network";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Account, ServiceAccount } from "@/stores/account/types";
import { Services } from "@/stores/account/types";
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

        error("Unable to find the plugin for this ServiceAccount: " + service.serviceId, "AccountManager.refreshAllAccounts");
      }
    }

    error("Your device is not connected to the internet, please check your connection.", "AccountManager.refreshAllAccounts");
    return undefined;
  }

  async getAllHomeworks(): Promise<Array<Homework>> {
    return this.fetchData(Capabilities.HOMEWORK, async (client) => {
      if (client.getHomeworks) {
        return await client.getHomeworks();
      }
      return [];
    });
  }

  async getAllNews(): Promise<Array<News>> {
    return this.fetchData(Capabilities.NEWS, async (client) => {
      if (client.getNews) {
        return await client.getNews();
      }
      return [];
    });
  }

  private hasInternetConnection(): boolean {
    const networkState = Network.useNetworkState();
    return networkState.isInternetReachable ?? false;
  }

  private async fetchData<T>(capability: Capabilities, fetchFn: (client: SchoolServicePlugin) => Promise<T[]>): Promise<T[]> {
    const data: T[] = [];
    if (!this.hasInternetConnection()) {
      error("No internet connection", "AccountManager.fetchData");
      return data;
    }

    for (const client of Object.values(this.clients)) {
      if (!client.capabilities.includes(capability)) continue;

      try {
        const fetched = await fetchFn(client);
        data.push(...fetched);
      } catch (err) {
        error(`Failed to fetch data for capability ${capability}: ${String(err)}`, "AccountManager.fetchData");
      }
    }

    return data;
  }

  private getServicePluginForAccount(service: ServiceAccount): SchoolServicePlugin | null {
    switch (service.serviceId) {
    case Services.PRONOTE:
      return new (require('@/services/pronote/index').Pronote)(service.id);
    default:
      console.warn(`Service plugin for ${service} not implemented.`);
      return null;
    }
  }
}