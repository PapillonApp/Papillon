import { Balance as SharedBalance } from "@/services/shared/balance";

import { Balance } from "../models/Balance";

export function mapBalancesToShared(balance: Balance): SharedBalance {
  return {
    createdByAccount: balance.createdByAccount,
    currency: balance.currency,
    lunchRemaining: balance.lunchRemaining,
    lunchPrice: balance.lunchPrice,
    amount: balance.amount,
    label: balance.label,
    fromCache: true
  }
}