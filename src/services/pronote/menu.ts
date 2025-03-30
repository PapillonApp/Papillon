import { PronoteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote, { Menu } from "pawnote";

export const getMenu = async (account: PronoteAccount, date: Date): Promise<Menu> => {
  if (!account.instance) {
    throw new ErrorServiceUnauthenticated("pronote");
  }

  const menu = await pronote.menus(account.instance, date);
  if (!menu.days?.length) {
    return { date };
  }

  const day = menu.days[0];

  const updatedDate = new Date(day.date);
  updatedDate.setDate(updatedDate.getDate() + 1);
  updatedDate.setUTCHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  if (updatedDate.getTime() !== targetDate.getTime()) {
    return { date };
  }

  return day;
};
