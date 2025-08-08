import { Balance } from "../models/Balance";
import { Balance as SharedBalance } from "@/services/shared/balance";

export function mapBalancesToShared(balance: Balance): SharedBalance {
	return {
			createdByAccount: balance.createdByAccount,
			currency: balance.currency,
			lunchRemaining: balance.lunchRemaining,
			lunchPrice: balance.lunchPrice,
			amount: balance.amount,
			label: balance.label
	}
}