import { Period } from "@/services/shared/grade";
import { warn } from "@/utils/logger/logger";

export function getCurrentPeriod(periods: Period[]): Period | undefined {
  const now = new Date().getTime();
  const excludedNames = [
    "Bac blanc",
    "Brevet blanc",
    "Hors période",
    "Année",
    "ANNÉE",
    "ANNEE",
    "Contrôle en cours de formation",
    "EPREUVES PONCTUELLES 1ERE SERIE",
    "EPREUVES PONCTUELLES 2EME SERIE",
    "MI-SEMESTRE 1",
    "MI-SEMESTRE 2",
    "Évaluation spécifique de DNL",
  ];

  periods = periods
    .filter(period => !excludedNames.includes(period.name))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const period of periods) {
    if (period.start.getTime() < now && period.end.getTime() > now) {
      return period;
    }
  }

  if (periods.length > 0) {
    warn(
      "Current period not found. Falling back to the first period in the array."
    );
    return periods[0];
  }

  // No periods yet (fresh account, nothing synced): a normal state, callers handle undefined.
  return undefined;
}