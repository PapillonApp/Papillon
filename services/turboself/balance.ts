import { Client } from "turboself-api";

import { Balance } from "../shared/balance";

export async function fetchTurboSelfBalance(session: Client, accountId: string): Promise<Balance[]> {
  const balances = await session.getBalances()
  const lunchPrice = (session.host?.lunchPrice ?? 0)
  return balances.map(balance => ({
    amount: balance.amount,
    currency: session.establishment?.currencySymbol ?? "€",
    lunchRemaining: lunchPrice > 0 ? Math.floor(balance.estimatedAmount / lunchPrice) : 0,
    lunchPrice,
    label: balance.label,
    createdByAccount: accountId
  }))
}