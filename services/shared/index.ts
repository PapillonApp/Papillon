import * as Network from "expo-network";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Account, ServiceAccount } from "@/stores/account/types";
import { Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";


export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(private account: Account) {}

  async refreshAllAccounts(): Promise<Pronote | undefined> {
    const networkState = Network.useNetworkState();
    if (networkState.isInternetReachable) {
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
    const networkState = Network.useNetworkState();
    const homeworks: Homework[] = [];
    if (networkState.isInternetReachable) {
      for (const client of Object.values(this.clients)) {
        if (client.capabilities.includes(Capabilities.HOMEWORK) && client.getHomeworks) {
          const clientHomeworks = await client.getHomeworks();
          homeworks.push(...clientHomeworks);
        }
      }
    }
    return homeworks;
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