import type { ARDAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";
import { ErrorServiceUnauthenticated } from "../shared/errors";

export const balance = async (account: ARDAccount): Promise<Balance[]> => {
  if (!account.instance) throw new ErrorServiceUnauthenticated("ARD");
  const payments = account.authentication.balances;
  const mealPrice = account.authentication.mealPrice;

  return payments.walletData.map(wallet => ({
    amount: wallet.walletAmount / 100,
    currency: "€",
    remaining: wallet.walletName.toLowerCase() !== "cafetaria" ? Math.floor((wallet.walletAmount / mealPrice!)) : null,
    price: mealPrice! / 100,
    label: wallet.walletName[0].toUpperCase() + wallet.walletName.slice(1).toLowerCase()
  })).reverse();

};
