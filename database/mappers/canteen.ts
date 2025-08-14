import CanteenMenu from "@/database/models/CanteenMenu";
import { CanteenMenu as SharedCanteenMenu, CanteenHistoryItem as SharedCanteenHistoryItem } from "@/services/shared/canteen";
import CanteenHistoryItem from "../models/CanteenHistory";

export function mapCanteenMenuToShared(menu: CanteenMenu): SharedCanteenMenu {
  return {
    date: new Date(menu.date),
    lunch: menu.lunch,
    dinner: menu.dinner,
    createdByAccount: menu.createdByAccount,
    fromCache: true
  }
}

export function mapCanteenTransactionToShared(transaction: CanteenHistoryItem): SharedCanteenHistoryItem {
  return {
    createdByAccount: transaction.createdByAccount,
    date: new Date(transaction.date),
    label: transaction.label,
    currency: transaction.currency,
    amount: transaction.amount
  }
}