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
    .filter(period =>
      period.start instanceof Date
      && period.end instanceof Date
      && !Number.isNaN(period.start.getTime())
      && !Number.isNaN(period.end.getTime())
      && !excludedNames.includes(period.name)
    )
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

  warn("Unable to find the current period and unable to fallback...");
  return undefined;
}