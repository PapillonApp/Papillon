import { Identification } from "ezly";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Balance } from "../shared/balance";
import { CanteenHistoryItem, QRCode } from "../shared/canteen";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchIzlyBalances } from "./balances";
import { fetchIzlyHistory } from "./history";
import { fetchIzlyQRCode } from "./qrcode";
import { refreshIzlyAccount } from "./refresh";

export class Izly implements SchoolServicePlugin {
  displayName = "Izly";
  service = Services.IZLY;
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.CANTEEN_BALANCE, Capabilities.CANTEEN_HISTORY, Capabilities.CANTEEN_QRCODE];
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