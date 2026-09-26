import { Client } from "turboself-api";

import { CanteenHistoryItem } from "../shared/canteen";

export async function fetchTurboSelfHistory(session: Client, accountId: string): Promise<CanteenHistoryItem[]> {
  const history = await session.getHistory()
  return history.map(transaction => ({
    date: new Date(transaction.date.getTime() + transaction.date.getTimezoneOffset() * 60000),
    label: transaction.label,
    currency: session.establishment?.currencySymbol ?? "€",
    amount: transaction.amount,
    createdByAccount: accountId
  }))
}