import { Client } from "alise-api";
import { CanteenHistoryItem } from "../shared/canteen";

export async function fetchAliseHistory(session: Client, accountId: string): Promise<CanteenHistoryItem[]> {
  const history = await session.getFinancialHistory();
  return history.map(event => ({
    date: event.date,
    label: event.label,
    currency: "€",
    amount: event.amount * 100,
    createdByAccount: accountId
  }));
}
