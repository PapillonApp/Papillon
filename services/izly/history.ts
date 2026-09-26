import { Identification, TransactionGroup, operations } from "ezly";
import { CanteenHistoryItem } from "../shared/canteen";

export async function fetchIzlyHistory(accountId: string, session: Identification): Promise<CanteenHistoryItem[]> {
  const payments = await operations(session, TransactionGroup.Payments)
  const topups = await operations(session, TransactionGroup.TopUp)
  const transfers = await operations(session, TransactionGroup.BankAccountTransfer)

  const allTransactions = [
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
  ];

  return allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}