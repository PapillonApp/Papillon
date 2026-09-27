import { PronoteApiClient } from "@/services/pronote/api-client";
import { CanteenMenu } from "@/services/shared/canteen";
import { error } from "@/utils/logger/logger";

export async function fetchPronoteCanteenMenu(
  authToken: string,
  accountId: string,
  date: Date,
  childName?: string
): Promise<CanteenMenu[]> {
  try {
    // Dates locales (pas toISOString/UTC) : évite le décalage ±1j selon fuseau.
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const fromStr = fmtLocal(date);
    const toDate = new Date(date);
    toDate.setDate(toDate.getDate() + 6);
    const toStr = fmtLocal(toDate);

    const data = await PronoteApiClient.getCanteen(authToken, fromStr, toStr, childName);

    return (data.menus || []).map((m: any) => {
      const mapFood = (f: any) => ({
        id: typeof f?.id === "string" ? f.id : null,
        name: typeof f === "string" ? f : (f?.name ?? ""),
        // Allergènes ≠ labels : sources distinctes quand disponibles.
        allergens: Array.isArray(f?.allergens)
          ? f.allergens.map((a: any) => (typeof a === "string" ? a : a?.name ?? ""))
          : Array.isArray(f?.allergenes)
            ? f.allergenes.map((a: any) => (typeof a === "string" ? a : a?.name ?? ""))
            : [],
        labels: Array.isArray(f?.labels) ? f.labels.map((l: any) => (typeof l === "string" ? { name: l } : { id: l?.id ?? null, name: l?.name ?? "", color: l?.color ?? null })) : undefined,
      });
      let lunchMeal = undefined;
      let dinnerMeal = undefined;

      if (m.meal) {
        const buildMeal = () => ({
          entry: (m.meal.entry || []).map(mapFood),
          main: (m.meal.main || []).map(mapFood),
          side: (m.meal.side || []).map(mapFood),
          cheese: (m.meal.cheese || []).map(mapFood),
          dessert: (m.meal.dessert || []).map(mapFood),
          other: (m.meal.other || []).map(mapFood),
          drink: [],
        });
        // Cloner : lunch et dinner ne doivent pas partager la même référence.
        if (m.is_lunch ?? true) lunchMeal = buildMeal();
        if (m.is_dinner ?? false) dinnerMeal = buildMeal();
      } else if (m.meals) {
        const rawLunch = m.meals?.[0];
        const rawDinner = m.meals?.[1];
        if (rawLunch) {
          lunchMeal = {
            entry: (rawLunch.items || []).slice(0, 2).map((name: string) => ({ name })),
            main: (rawLunch.items || []).slice(2, 4).map((name: string) => ({ name })),
            side: [],
            cheese: [],
            dessert: (rawLunch.items || []).slice(4).map((name: string) => ({ name })),
            drink: [],
          };
        }
        if (rawDinner) {
          dinnerMeal = {
            entry: (rawDinner.items || []).slice(0, 2).map((name: string) => ({ name })),
            main: (rawDinner.items || []).slice(2, 4).map((name: string) => ({ name })),
            side: [],
            cheese: [],
            dessert: (rawDinner.items || []).slice(4).map((name: string) => ({ name })),
            drink: [],
          };
        }
      }

      const parsed = m.date ? new Date(m.date) : new Date(NaN);
      if (isNaN(parsed.getTime())) return null;
      return {
        date: parsed,
        createdByAccount: accountId,
        lunch: lunchMeal,
        dinner: dinnerMeal,
      };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  } catch (err) {
    error(`Failed to fetch canteen menu: ${err}`, "fetchPronoteCanteenMenu");
    return [];
  }
}