import type { Period } from "../shared/Period";
import type pronote from "pawnote";

export function decodePeriod (p: pronote.Period): Period {
  return {
    name: p.name,
    startTimestamp: p.startDate.getTime(),
    endTimestamp: p.endDate.getTime()
  };
}