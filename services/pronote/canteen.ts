import {
  Food as PawnoteFood,
  Meal as PawnoteMeal,
  Menu,
  menus,
  SessionHandle,
} from "@blockshub/pawnote-lts";

import { CanteenMenu, Food, Meal } from "@/services/shared/canteen";
import { error } from "@/utils/logger/logger";

export async function fetchPronoteCanteenMenu(
  session: SessionHandle,
  accountId: string,
  date: Date
): Promise<CanteenMenu[]> {
  if (!session) {
    throw error("Session is undefined", "fetchPronoteAttendance");
  }

  const weeklyMenu = await menus(session, date);
  if (!Array.isArray(weeklyMenu.days) || weeklyMenu.days.length === 0) {
    return [];
  }

  return weeklyMenu.days.map(day => ({
    date: day.date,
    createdByAccount: accountId,
    ...mapCanteenMenu(day),
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

function mapCanteenMenu(menu: Menu): { lunch: Meal; dinner: Meal } {
  return {
    lunch: mapMeal(menu.lunch),
    dinner: mapMeal(menu.dinner),
  };
}

function mapMeal(meal: PawnoteMeal | undefined): Meal {
  return {
    entry: mapFood(Array.isArray(meal?.entry) ? meal.entry : []),
    main: mapFood(Array.isArray(meal?.main) ? meal.main : []),
    side: mapFood(Array.isArray(meal?.side) ? meal.side : []),
    cheese: mapFood(Array.isArray(meal?.fromage) ? meal.fromage : []),
    dessert: mapFood(Array.isArray(meal?.dessert) ? meal.dessert : []),
    drink: mapFood(Array.isArray(meal?.drink) ? meal.drink : []),
  };
}

function mapFood(meal: PawnoteFood[]): Food[] {
  return meal.map(food => ({
    name: food.name,
    allergens: food.allergens?.length
      ? food.allergens.map(allergen => allergen.name)
      : undefined,
  }));
}
