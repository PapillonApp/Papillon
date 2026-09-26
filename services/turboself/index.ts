import { Client } from "turboself-api"

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Balance } from "../shared/balance";
import { Booking, BookingDay, CanteenHistoryItem, CanteenKind, QRCode } from "../shared/canteen";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchTurboSelfBalance } from "./balance";
import { fetchTurboSelfBookingsWeek, setTurboSelfMealBookState } from "./booking";
import { fetchTurboSelfHistory } from "./history";
import { fetchTurboSelfQRCode } from "./qrcode";
import { refreshTurboSelfAccount } from "./refresh";

export class TurboSelf implements SchoolServicePlugin {
  displayName = "TurboSelf";
  service = Services.TURBOSELF
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.CANTEEN_BALANCE,
    Capabilities.CANTEEN_BOOKINGS,
    Capabilities.CANTEEN_HISTORY,
    Capabilities.CANTEEN_QRCODE
  ];
  session: Client | undefined = undefined
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<TurboSelf> {
    const refresh = await refreshTurboSelfAccount(this.accountId, credentials)

    this.authData = refresh.auth
    this.session = refresh.session

    return this;
  }

  getCanteenKind(): CanteenKind {
    if (!this.session) { return CanteenKind.ARGENT };

    if (this.session.host?.permissions.bookWithNegativeBalance) { return CanteenKind.FORFAIT };

    if (this.session?.host?.mode === "Argent") {
      return CanteenKind.ARGENT;
    }

    return CanteenKind.FORFAIT;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session) {
      return fetchTurboSelfBalance(this.session, this.accountId)
    }

    error("Session is not valid", "TurboSelf.getCanteenBalances");
  }

  async getCanteenTransactionsHistory(): Promise<CanteenHistoryItem[]> {
    if (this.session) {
      return fetchTurboSelfHistory(this.session, this.accountId)
    }
		
    error("Session is not valid", "TurboSelf.getCanteenTransactionsHistory")
  }

  async getCanteenQRCodes(): Promise<QRCode> {
    if (this.session) {
      return fetchTurboSelfQRCode(this.session, this.accountId)
    }

    error("Session is not valid", "TurboSelf.getCanteenQRCodes")
  }
	
  async getCanteenBookingWeek(weekNumber: number): Promise<BookingDay[]> {
    if (this.session) {
      return fetchTurboSelfBookingsWeek(this.session, this.accountId, weekNumber)
    }

    error("Session is not valid", "TurboSelf.getCanteenBookingWeek")
  }

  async setMealAsBooked(meal: Booking, booked?: boolean): Promise<Booking> {
    return setTurboSelfMealBookState(meal, booked)
  }
}