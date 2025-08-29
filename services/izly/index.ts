import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { refreshIzlyAccount } from "./refresh";
import { Identification } from "ezly";
import { Balance } from "../shared/balance";
import { fetchIzlyBalances } from "./balances";
import { error } from "@/utils/logger/logger";
import { CanteenHistoryItem, QRCode } from "../shared/canteen";
import { fetchIzlyHistory } from "./history";
import { fetchIzlyQRCode } from "./qrcode";

export class Izly implements SchoolServicePlugin {
  displayName = "Izly";
  service = Services.IZLY;
  capabilities: Capabilities[] = [];
  session: Identification | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Izly> {
    const refresh = await refreshIzlyAccount(this.accountId, credentials)

    this.authData = refresh.auth;
    this.session = refresh.session;

    return this;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session) {
      return fetchIzlyBalances(this.accountId, this.session)
    }

    error("Session is not valid", "Izly.getCanteenBalances")
  }

  async getCanteenTransactionsHistory(): Promise<CanteenHistoryItem[]> {
    if (this.session) {
      return fetchIzlyHistory(this.accountId, this.session);
    }

    error("Session is not valid", "Izly.getCanteenTransactionsHistory")
  }

  async getCanteenQRCodes(): Promise<QRCode> {
    if (this.session) {
      return fetchIzlyQRCode(this.accountId, this.session)
    }

    error("Session is not valid", "Izly.getCanteenQRCodes")
  }
}