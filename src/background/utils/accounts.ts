import { useAccounts, useCurrentAccount } from "@/stores/account";
import { PrimaryAccount } from "@/stores/account/types";

export const getAccounts = (): PrimaryAccount[] => {
  return useAccounts
    .getState()
    .accounts.filter((account) => !account.isExternal);
};

export const getSwitchToFunction = () => {
  return useCurrentAccount.getState().switchTo;
};

export const getCurrentAccount = (): PrimaryAccount => {
  return useCurrentAccount.getState().account!;
};
