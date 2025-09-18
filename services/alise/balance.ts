import { Client } from "alise-api";
import { Balance } from "../shared/balance";

export async function fetchAliseBalance(session: Client, accountId: string): Promise<Balance[]> {
  const account = await session.getInformations();
  return [{
    amount: account.balance * 100,
    currency: "€",
    lunchRemaining: 0,
    lunchPrice: 0,
    label: account.establishment,
    createdByAccount: accountId
  }];
}
