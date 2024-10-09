import { AccountService, type ExternalAccount } from "@/stores/account/types";
import type { Balance } from "./shared/Balance";

export const balanceFromExternal = async (account: ExternalAccount): Promise<Balance[]> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getBalance } = await import("./turboself/balance");
      const balance = await getBalance(account);
      return balance;
    }
    case AccountService.ARD: {
      const { balance } = await import("./ard/balance");
      return balance(account);
    }
    default: {
      return [];
    }
  }
};