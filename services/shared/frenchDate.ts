import { isValid, parse } from "date-fns";
import { fr } from "date-fns/locale";

export function parseFrenchDate(text: string): Date | undefined {
  const value = text.replace(/\s+/g, " ").trim();
  const numeric = value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  const date = numeric
    ? parse(value, "d/M/yyyy", new Date())
    : parse(value.replace(/^1er\b/i, "1"), "d MMMM yyyy", new Date(), {
        locale: fr,
      });
  return isValid(date) ? date : undefined;
}
