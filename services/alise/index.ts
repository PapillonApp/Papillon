import { Client } from "alise-api";
import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import { Balance } from "../shared/balance";
import { CanteenHistoryItem } from "../shared/canteen";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchAliseBalance } from "./balance";
import { fetchAliseHistory } from "./history";
import { refreshAliseAccount } from "./refresh";

export class Alise implements SchoolServicePlugin {
  displayName = "Alise";
  service = Services.ALISE;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.CANTEEN_BALANCE,
    Capabilities.CANTEEN_HISTORY
  ];
  session: any = undefined;
  authData: Auth = {};
  accountId: string;
  tokenExpiration?: Date;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  checkTokenValidty = () => true;

  async refreshAccount(credentials: Auth): Promise<Alise> {
    try {
      const refresh = await refreshAliseAccount(this.accountId, credentials);
      this.authData = refresh.auth;
      this.session = refresh.session;
      return this;
    } catch (refreshError) {
      error("Failed to refresh Alise account", "Alise.refreshAccount");
    }
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (!this.session) {
      error("Session is not valid", "Alise.getCanteenBalances");
    }
    try {
      return await fetchAliseBalance(this.session, this.accountId);
    } catch (err) {
      error("Failed to fetch canteen balances", "Alise.getCanteenBalances");
    }
  }

  async getCanteenTransactionsHistory(): Promise<CanteenHistoryItem[]> {
    if (!this.session) {
      error("Session is not valid", "Alise.getCanteenTransactionsHistory");
    }
    try {
      return await fetchAliseHistory(this.session, this.accountId);
    } catch (err) {
      error("Failed to fetch canteen history", "Alise.getCanteenTransactionsHistory");
    }
  }


}
