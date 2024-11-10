import { AccountService, type ExternalAccount } from "@/stores/account/types";
import type { ReservationHistory } from "./shared/ReservationHistory";

export const reservationHistoryFromExternal = async (account: ExternalAccount): Promise<ReservationHistory[]> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getHistory } = await import("./turboself/history");
      return getHistory(account);
    }
    case AccountService.ARD: {
      const { history: getHistory } = await import("./ard/history");
      return getHistory(account);
    }
    case AccountService.Izly: {
      const { history: getHistory } = await import("./izly/history");
      return getHistory(account);
    }
    default: {
      return [];
    }
  }
};