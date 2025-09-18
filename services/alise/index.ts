import { Client } from "alise-api";
import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import { Balance } from "../shared/balance";
import { Booking, BookingDay, CanteenHistoryItem, QRCode } from "../shared/canteen";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchAliseBalance } from "./balance";
import { fetchAliseBookingsWeek, setAliseMealBookState } from "./booking";
import { fetchAliseHistory } from "./history";
import { fetchAliseQRCode } from "./qrcode";
import { refreshAliseAccount } from "./refresh";

export class Alise implements SchoolServicePlugin {
  displayName = "Alise";
  service = Services.ALISE;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.CANTEEN_BALANCE,
    Capabilities.CANTEEN_BOOKINGS,
    Capabilities.CANTEEN_HISTORY,
    Capabilities.CANTEEN_QRCODE
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
    const refresh = await refreshAliseAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;
    return this;
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session) {
      return fetchAliseBalance(this.session, this.accountId);
    }
    error("Session is not valid", "Alise.getCanteenBalances");
    return [];
  }

  async getCanteenTransactionsHistory(): Promise<CanteenHistoryItem[]> {
    if (this.session) {
      return fetchAliseHistory(this.session, this.accountId);
    }
    error("Session is not valid", "Alise.getCanteenTransactionsHistory");
    return [];
  }

  async getCanteenQRCodes(): Promise<QRCode> {
    if (this.session) {
      return fetchAliseQRCode(this.session, this.accountId);
    }
    error("Session is not valid", "Alise.getCanteenQRCodes");
    return { type: 0, data: "", createdByAccount: this.accountId };
  }

  async getCanteenBookingWeek(weekNumber: number): Promise<BookingDay[]> {
    if (this.session) {
      return fetchAliseBookingsWeek(this.session, this.accountId, weekNumber);
    }
    error("Session is not valid", "Alise.getCanteenBookingWeek");
    return [];
  }

  async setMealAsBooked(meal: Booking, booked?: boolean): Promise<Booking> {
    return setAliseMealBookState(meal, booked);
  }
}
