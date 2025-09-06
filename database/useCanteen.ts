import { Model, Q } from "@nozbe/watermelondb";

import { CanteenMenu as SharedCanteenMenu, CanteenHistoryItem as SharedCanteenHistoryItem } from "@/services/shared/canteen";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapCanteenMenuToShared, mapCanteenTransactionToShared } from "./mappers/canteen";
import CanteenMenu from "./models/CanteenMenu";
import CanteenHistoryItem from "./models/CanteenHistory";


export async function addCanteenMenuToDatabase(menus: SharedCanteenMenu[]) {
  const db = getDatabaseInstance();
  for (const item of menus) {
    const id = generateId(item.createdByAccount + item.date)
    const existing = await db.get('canteenmenus').query(Q.where('menuId', id)).fetch();

    if (existing.length === 0) {
      await db.write(async () => {
        await db.get('canteenmenus').create((record: Model) => {
          const menu = record as CanteenMenu;
          Object.assign(menu, {
            menuId: id,
            date: item.date.getTime(),
            lunch: JSON.stringify(item.lunch),
            dinner: JSON.stringify(item.dinner),
            createdByAccount: item.createdByAccount
          });
        });
      });
    }
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
  for (const item of transactions) {
    const id = generateId(item.createdByAccount + item.date + item.amount + item.label + item.currency)
    const existing = await db.get('canteentransactions').query(
      Q.where('transactionId', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await db.write(async () => {
      await db.get('canteentransactions').create((record: Model) => {
        const menu = record as CanteenHistoryItem;
        Object.assign(menu, {
          createdByAccount: item.createdByAccount,
          transactionId: id,
          date: item.date,
          label: item.label,
          currency: item.currency,
          amount: item.amount
        });
      });
    });
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