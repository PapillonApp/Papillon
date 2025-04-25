import { AliseAccount } from "@/stores/account/types";
import { FoodItem, Menu } from "../shared/Menu";

const getWeekNumberByDate = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

export const getMenu = async (account: AliseAccount, date: Date): Promise<Menu> => {
  const weekNumber = getWeekNumberByDate(date); //futur implementation with alise-api
  const menus = await account.authentication.session.getWeeklyMenu();
  const menu = menus.find((menu) => {
    const menuDate = new Date(menu.date);
    menuDate.setHours(0, 0, 0, 0);
    return menuDate.getTime() === date.getTime();
  });

  return {
    date: date,
    lunch: {
      main: menu?.lunch?.map((item) => ({ name: item } as FoodItem))
    },
    dinner: {
      main: menu?.lunch?.map((item) => ({ name: item } as FoodItem))
    }
  };
};
