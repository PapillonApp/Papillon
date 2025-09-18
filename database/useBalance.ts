import { Model, Q } from "@nozbe/watermelondb";

import { Balance as SharedBalance } from "@/services/shared/balance";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapBalancesToShared } from "./mappers/balances";
import { Balance } from "./models/Balance";
import { safeWrite } from "./utils/safeTransaction";

export async function addBalancesToDatabase(balances: SharedBalance[]) {
  const db = getDatabaseInstance();
  for (const balance of balances) {
    const id = generateId(balance.label + balance.createdByAccount)
    const existing = await db.get('balances').query(Q.where('balanceId', id)).fetch();

    if (existing.length === 0) {
      await safeWrite(db, async () => {
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
      }, 10000, 'addBalancesToDatabase')
    }
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