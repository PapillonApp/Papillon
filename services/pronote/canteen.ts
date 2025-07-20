import { Food as PawnoteFood, Meal as PawnoteMeal, Menu, menus, SessionHandle } from "pawnote";
import { error } from "@/utils/logger/logger";
import { CanteenMenu, Food, Meal } from "@/services/shared/canteen";

export async function fetchPronoteCanteenMenu(
  session: SessionHandle,
  date: Date
): Promise<CanteenMenu[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteAttendance");
  }

  const weeklyMenu = await menus(session, date);
  if (!weeklyMenu.days?.length) {
    return [];
  }

  return weeklyMenu.days.map(day => ({
    date: day.date,
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
    entry: mapFood([...meal?.entry ?? []]),
    main: mapFood([...meal?.main ?? []]),
    side: mapFood([...meal?.side ?? []]),
    cheese: mapFood([...meal?.fromage ?? []]),
    dessert: mapFood([...meal?.dessert ?? []]),
    drink: mapFood([...meal?.drink ?? []]),
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