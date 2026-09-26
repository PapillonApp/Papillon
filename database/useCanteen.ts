import { Model, Q } from "@nozbe/watermelondb";

import { CanteenHistoryItem as SharedCanteenHistoryItem,CanteenMenu as SharedCanteenMenu } from "@/services/shared/canteen";
import { generateId } from "@/utils/generateId";
import { info,warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapCanteenMenuToShared, mapCanteenTransactionToShared } from "./mappers/canteen";
import CanteenHistoryItem from "./models/CanteenHistory";
import CanteenMenu from "./models/CanteenMenu";
import { safeWrite } from "./utils/safeTransaction";


export async function addCanteenMenuToDatabase(menus: SharedCanteenMenu[]) {
  const db = getDatabaseInstance();

  const menusToCreate: Array<{
    id: string;
    item: SharedCanteenMenu;
  }> = [];

  for (const item of menus) {
    const id = generateId(item.createdByAccount + item.date);
    const existing = await db.get('canteenmenus').query(Q.where('menuId', id)).fetch();

    if (existing.length === 0) {
      menusToCreate.push({ id, item });
    }
  }

  if (menusToCreate.length > 0) {
    await safeWrite(
      db,
      async () => {
        const promises = menusToCreate.map(({ id, item }) =>
          db.get('canteenmenus').create((record: Model) => {
            const menu = record as CanteenMenu;
            Object.assign(menu, {
              menuId: id,
              date: item.date.getTime(),
              lunch: JSON.stringify(item.lunch),
              dinner: JSON.stringify(item.dinner),
              createdByAccount: item.createdByAccount
            });
          })
        );
        await Promise.all(promises);
      },
      10000,
      `add_canteen_menus_${menusToCreate.length}_items`
    );
  } else {
    info(`🍉 No new canteen menus to add (all ${menus.length} already exist)`);
  }
}

export async function getCanteenMenuFromCache(startDate: Date): Promise<SharedCanteenMenu[]> {
  try {
    const database = getDatabaseInstance();
    const { start, end } = getWeekRangeForDate(startDate);

    const menus = await database
      .get<CanteenMenu>('canteenmenus')
      .query(Q.where('date', Q.between(start.getTime(), end.getTime())))
      .fetch();

    return menus
      .map(mapCanteenMenuToShared)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

export async function addCanteenTransactionToDatabase(transactions: SharedCanteenHistoryItem[]) {
  const db = getDatabaseInstance();

  const transactionsToCreate: Array<{
    id: string;
    item: SharedCanteenHistoryItem;
  }> = [];

  for (const item of transactions) {
    const id = generateId(item.createdByAccount + item.date + item.amount + item.label + item.currency);
    const existing = await db.get('canteentransactions').query(
      Q.where('transactionId', id)
    ).fetch();

    if (existing.length === 0) {
      transactionsToCreate.push({ id, item });
    }
  }

  if (transactionsToCreate.length > 0) {
    await safeWrite(
      db,
      async () => {
        const promises = transactionsToCreate.map(({ id, item }) =>
          db.get('canteentransactions').create((record: Model) => {
            const transaction = record as CanteenHistoryItem;
            Object.assign(transaction, {
              createdByAccount: item.createdByAccount,
              transactionId: id,
              date: item.date,
              label: item.label,
              currency: item.currency,
              amount: item.amount
            });
          })
        );
        await Promise.all(promises);
      },
      10000,
      `add_canteen_transactions_${transactionsToCreate.length}_items`
    );
  } else {
    info(`🍉 No new canteen transactions to add (all ${transactions.length} already exist)`);
  }
}

export async function getCanteenTransactionsFromCache(): Promise<SharedCanteenHistoryItem[]> {
  try {
    const database = getDatabaseInstance();

    const transactions = await database
      .get<CanteenHistoryItem>('canteentransactions')
      .query()
      .fetch();

    return transactions
      .map(mapCanteenTransactionToShared)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

export function getWeekRangeForDate(date: Date) {
  const day = date.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}