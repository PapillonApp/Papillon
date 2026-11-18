import { Client } from "turboself-api";

import { Balance } from "../shared/balance";

export async function fetchTurboSelfBalance(session: Client, accountId: string): Promise<Balance[]> {
  const balances = session.balances?.length ? session.balances : await session.getBalances();
  const currency = session.establishment?.currencySymbol ?? "€";
  const lunchPrice = session.host?.lunchPrice ?? 0;

  if (balances.length === 0 && session.host) {
    return [{
      amount: 0,
      currency,
      lunchRemaining: 0,
      lunchPrice,
      label: session.host.mode ?? "TurboSelf",
      createdByAccount: accountId,
    }];
  }

  return balances.map(balance => ({
    amount: balance.estimatedAmount,
    currency,
    lunchRemaining: lunchPrice > 0 ? Math.floor(balance.estimatedAmount / lunchPrice) : 0,
    lunchPrice,
    label: balance.label,
    createdByAccount: accountId,
  }));
}