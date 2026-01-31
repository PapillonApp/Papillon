import { Period } from "../shared/grade";

export function getCurrentWebUntisPeriod(): Period {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  
  return {
    id: "all-year",
    name: "Toute l'année",
    start: new Date(year),
    end: new Date(year + 1),
    createdByAccount: "webuntis"
  };
}