import { Client } from "turboself-api";
import { Balance } from "../shared/balance";

export async function fetchTurboSelfBalance(session: Client, accountId: string): Promise<Balance[]> {
	const balances = await session.getBalances()
	return balances.map(balance => ({
		amount: balance.amount,
		currency: session.establishment?.currencySymbol ?? "€",
		lunchRemaining: Math.floor(balance.estimatedAmount / (session.host?.lunchPrice ?? 0)),
		lunchPrice: (session.host?.lunchPrice ?? 0),
		label: balance.label,
		createdByAccount: accountId
	}))
}