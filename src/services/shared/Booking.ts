import { ARDAccount, TurboselfAccount } from "@/stores/account/types";

export interface BookingTerminal {
  id: string;
  week: number;
  from: Date;
  to: Date;
  terminalLabel: string;
  days: BookingDay[];
  account: TurboselfAccount | ARDAccount;
}

export interface BookingDay {
  id: string;
  canBook: boolean;
  date: Date;
  message: string;
  booked: boolean;
}
