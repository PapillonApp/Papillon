import {AccountService, type ExternalAccount} from "@/stores/account/types";
import type {Balance} from "./shared/Balance";

export const balanceFromExternal = async (account: ExternalAccount): Promise<Balance[]> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getBalance } = await import("./turboself/balance");
      return getBalance(account);
    }
    case AccountService.ARD: {
      const { balance } = await import("./ard/balance");
      return balance(account);
    }
    case AccountService.Izly: {
      const { balance } = await import("./izly/balance");
      return balance(account);
    }
    default: {
      return [];
    }
  }
};