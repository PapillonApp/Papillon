import type { TurboselfAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";

export const getBalance = async (account: TurboselfAccount): Promise<Balance[]> => {
  const balances = await account.authentication.session.balances;
  const currencySymbol = await account.authentication.session.establishment?.currencySymbol;
  const lunchPrice = await account.authentication.session.host?.lunchPrice;

  const result: Balance[] = [];
  for (const balance of balances ?? []) {
    result.push({
      amount: balance.estimatedAmount / 100,
      currency: currencySymbol ?? "€",
      remaining: Math.floor(balance.estimatedAmount / (lunchPrice ?? 0)),
      price: (lunchPrice ?? 0) / 100,
      label: balance.label
    });
  }
  return result;
};
