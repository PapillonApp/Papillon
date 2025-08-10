import { Client } from "pawrd";
import { CanteenHistoryItem } from "../shared/canteen";
import { error } from "@/utils/logger/logger";

export async function fetchARDHistory(
  session: Client,
  accountId: string
): Promise<CanteenHistoryItem[]> {
  const uid = await session.getOnlinePayments().then((payments) => payments.user.uid);
  if (!uid) {
    error("An error occured during UID retrieving")
  }

  let [financialHistory, ordersHistory, consumptionsHistory] = await Promise.all([
    session.getFinancialHistory(uid),
    session.getOrdersHistory(uid),
    session.getConsumptionsHistory(uid)
  ]);

  return [
    ...financialHistory.map(item => ({
        date: new Date(item.operationDate * 1000),
        label: item.operationName,
        currency: "€",
        amount: ((item.credit ?? 0) - (item.debit ?? 0)),
        createdByAccount: accountId
    })),
    ...ordersHistory.map(item => ({
        date: new Date(item.orderDate * 1000),
        label: "Transaction n°" + item.orderReference.toString(),
        currency: "€",
        amount: item.amount,
        createdByAccount: accountId
    })),
    ...consumptionsHistory.map(item => ({
        date: new Date(item.consumptionDate * 1000),
        label: item.consumptionDescription,
        currency: "€",
        amount: -item.amount,
        createdByAccount: accountId
    }))
  ]
}
