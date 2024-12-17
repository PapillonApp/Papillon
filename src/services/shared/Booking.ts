import { AliseAccount, ARDAccount, TurboselfAccount } from "@/stores/account/types";

export interface BookingTerminal {
  id: string;
  terminalLabel: string;
  days: BookingDay[];
  account: TurboselfAccount | ARDAccount | AliseAccount;
}

export interface BookingDay {
  id: string;
  canBook: boolean;
  date?: Date;
  booked: boolean;
}
