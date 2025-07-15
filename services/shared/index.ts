import { Account, Auth } from "@/stores/account/types";
import { SchoolServicePlugin } from "@/services/shared/types";
import { Services } from "@/stores/account/types";
import * as Network from "expo-network";
import { error } from "@/utils/logger/logger";
import { Pronote } from "@/services/pronote";


export class AccountManager {
  private clients: Record<string, SchoolServicePlugin> = {};

  constructor(private account: Account) {}

  async refreshAllAccounts(): Promise<Pronote | undefined> {
    const networkState = Network.useNetworkState();
    if (networkState.isInternetReachable) {
      for (const service of this.account.services) {
        const plugin = this.getServicePlugin(service.serviceId);
        if (plugin) {
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

  private getServicePlugin(service: Services): SchoolServicePlugin | null {
    switch (service) {
      case Services.PRONOTE:
        return new (require('@/services/pronote/index').Pronote)();
      default:
        console.warn(`Service plugin for ${service} not implemented.`);
        return null;
    }
  }
}