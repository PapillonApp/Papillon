import { PronoteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote from "pawnote";
import { Menu } from "../shared/Menu";

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
  updatedDate.setUTCHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  if (updatedDate.getTime() !== targetDate.getTime()) {
    return { date };
  }

  return {
    date,
    lunch: day.lunch
      ? {
        ...day.lunch,
        entry: day.lunch.entry?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        main: day.lunch.main?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        side: day.lunch.side?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        cheese: day.lunch.fromage?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        dessert: day.lunch.dessert?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        drink: day.lunch.drink?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        }))
      }
      : undefined,
    dinner: day.dinner
      ? {
        ...day.dinner,
        entry: day.dinner.entry?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        main: day.dinner.main?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        side: day.dinner.side?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        cheese: day.dinner.fromage?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        dessert: day.dinner.dessert?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        })),
        drink: day.dinner.drink?.map(item => ({
          ...item,
          allergens: [...item.allergens],
          labels: [...item.labels]
        }))
      }
      : undefined
  };
};
