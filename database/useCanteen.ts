import { Model, Q } from "@nozbe/watermelondb";

import { CanteenMenu as SharedCanteenMenu } from "@/services/shared/canteen";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapCanteenMenuToShared } from "./mappers/canteen";
import CanteenMenu from "./models/CanteenMenu";


export async function addCanteenMenuToDatabase(menus: SharedCanteenMenu[]) {
  const db = getDatabaseInstance();
  for (const item of menus) {
    const id = generateId(item.createdByAccount + item.date)
    const existing = await db.get('canteenmenus').query(
      Q.where('id', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await db.write(async () => {
      await db.get('canteenmenus').create((record: Model) => {
        const menu = record as CanteenMenu;
        Object.assign(menu, {
          id: id,
          date: item.date.getTime(),
          lunch: JSON.stringify(item.lunch),
          dinner: JSON.stringify(item.dinner),
          createdByAccount: item.createdByAccount
        });
      });
    });
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

function getWeekRangeForDate(date: Date) {
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