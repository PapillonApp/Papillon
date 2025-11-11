import { Client } from "pawrd";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Balance } from "../shared/balance";
import { CanteenHistoryItem } from "../shared/canteen";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchArdBalance } from "./balance";
import { fetchARDHistory } from "./history";
import { refreshArdAccount } from "./refresh";

export class ARD implements SchoolServicePlugin {
  displayName = "ARD";
  service = Services.ARD;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session: Client | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  private async initCapabilities() {
    setTimeout(() => {
      this.capabilities.push(Capabilities.CANTEEN_BALANCE, Capabilities.CANTEEN_HISTORY)
    }, 3000)
  }

  async refreshAccount(credentials: Auth): Promise<ARD> {
    const refresh = await refreshArdAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;
    this.initCapabilities()
    return this;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session) {
      return fetchArdBalance(this.session, this.accountId, this.authData);
    }
		
    error("Session is not valid", "ARD.getCanteenBalances");
  }

  async getCanteenTransactionsHistory(): Promise<CanteenHistoryItem[]> {
    if (this.session) {
      return fetchARDHistory(this.session, this.accountId)
    }

    error("Session is not valid", "ARD.getCanteenTransactionsHistory")
  }
}
