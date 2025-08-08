import { Balance as SharedBalance } from "@/services/shared/balance";
import { getDatabaseInstance } from "./DatabaseProvider";
import { generateId } from "@/utils/generateId";
import { Model, Q } from "@nozbe/watermelondb";
import { Balance } from "./models/Balance";
import { warn } from "@/utils/logger/logger";
import { mapBalancesToShared } from "./mappers/balances";

export async function addBalancesToDatabase(balances: SharedBalance[]) {
	const db = getDatabaseInstance();
	for (const balance of balances) {
		const id = generateId(balance.label + balance.createdByAccount)
		const existing = await db.get('balances').query(
			Q.where("balanceId", id)
		)

		if (existing.length > 0) {continue;}

		await db.write(async () => {
			await db.get('balances').create((record: Model) => {
				const balanceModel = record as Balance;
				Object.assign(balanceModel, {
					createdByAccount: balance.createdByAccount,
					balanceId: id,
					currency: balance.currency,
					amount: balance.amount,
					lunchRemaining: balance.lunchRemaining,
					lunchPrice: balance.lunchPrice,
					label: balance.label
				})
			})
		})
	}
}

export async function getBalancesFromCache(): Promise<SharedBalance[]> {
	try {
		const database = getDatabaseInstance();
		const balances = await database
			.get<Balance>('balances')
			.query()
			.fetch()

			return balances.map(mapBalancesToShared)
	} catch (e) {
		warn(String(e));
		return [];
	}
}