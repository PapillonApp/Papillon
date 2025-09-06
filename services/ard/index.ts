import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { Client } from "pawrd";
import { refreshArdAccount } from "./refresh";
import { Balance } from "../shared/balance";
import { error } from "@/utils/logger/logger";
import { fetchArdBalance } from "./balance";
import { CanteenHistoryItem } from "../shared/canteen";
import { fetchARDHistory } from "./history";

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
