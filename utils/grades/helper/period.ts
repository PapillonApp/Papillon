import { Period } from "@/services/shared/grade";
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
      !excludedNames.includes(period.name) &&
      Number.isFinite(period.start?.getTime()) &&
      Number.isFinite(period.end?.getTime()) &&
      period.end.getTime() >= period.start.getTime()
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const period of periods) {
    if (period.start.getTime() <= now && period.end.getTime() >= now) {
      return period;
    }
  }

  // During holidays and just before a new school year, none of the dates may
  // contain today. Prefer the next period; after the school year, use the last
  // one that ended. An empty or malformed response simply has no selection.
  return periods.find(period => period.start.getTime() > now) ?? periods.at(-1);
}
