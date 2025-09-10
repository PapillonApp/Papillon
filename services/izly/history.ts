import { Identification, OperationKind, operations } from "ezly";
import { CanteenHistoryItem } from "../shared/canteen";

export async function fetchIzlyHistory(accountId: string, session: Identification): Promise<CanteenHistoryItem[]> {
  const payments = await operations(session, OperationKind.Payment)
  const topups = await operations(session, OperationKind.TopUp)
  const transfers = await operations(session, OperationKind.Transfer)

  return [
    ...payments.map(item => ({
      date: item.date,
      label: "Paiement",
      currency: "€",
      amount: (item.isCredit ? item.amount : -item.amount) * 100,
      createdByAccount: accountId
    })),
    ...topups.map(item => ({
      date: item.date,
      label: "Rechargement",
      currency: "€",
      amount: (item.isCredit ? item.amount : -item.amount) * 100,
      createdByAccount: accountId
    })),
    ...transfers.map(item => ({
      date: item.date,
      label: "Transfert",
      currency: "€",
      amount: (item.isCredit ? item.amount : -item.amount) * 100,
      createdByAccount: accountId
    }))
  ]
}