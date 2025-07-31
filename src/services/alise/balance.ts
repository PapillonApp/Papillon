import type { AliseAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";

export const getBalance = async (account: AliseAccount, force = false): Promise<Array<Balance>> => {
  const balance = force ? (await account.authentication.session.getInformations()).balance : account.authentication.session.account?.balance ?? 0;
  const mealPrice = account.authentication.mealPrice;

  return [{
    amount: balance,
    currency: "€",
    remaining: Math.floor(balance / (mealPrice ?? 0)),
    price: mealPrice ?? 0,
    label: "Self"
  }];
};