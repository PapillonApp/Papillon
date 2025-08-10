import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { Client } from "pawrd";
import { refreshArdAccount } from "./refresh";
import { Balance } from "../shared/balance";
import { error } from "@/utils/logger/logger";
import { fetchArdBalance } from "./balance";

export class ARD implements SchoolServicePlugin {
  displayName = "ARD";
  service = Services.ARD;
  capabilities: Capabilities[] = [Capabilities.REFRESH];

  async initializeCapabilities(): Promise<void> {
    this.capabilities = [Capabilities.REFRESH];

    setTimeout(() => {
      this.capabilities = [Capabilities.REFRESH, Capabilities.CANTEEN_BALANCE];
    }, 5000);
  }
  session: Client | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<ARD> {
    const refresh = await refreshArdAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;
    return this;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session) {
      return fetchArdBalance(this.session, this.accountId);
    }
		
    error("Session is not valid", "ARD.getCanteenBalances");
  }
}
