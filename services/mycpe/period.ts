import { Period } from "@/services/shared/grade";

export function getMyCpeAcademicPeriod(
  accountId: string,
  referenceDate = new Date()
): Period {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("La date de référence My CPE est invalide.");
  }

  const startYear =
    referenceDate.getMonth() >= 8
      ? referenceDate.getFullYear()
      : referenceDate.getFullYear() - 1;
  const endYear = startYear + 1;

  return {
    id: `mycpe-academic-year-${startYear}-${endYear}`,
    name: `Année universitaire ${startYear}-${endYear}`,
    start: new Date(startYear, 8, 1, 0, 0, 0, 0),
    end: new Date(endYear, 7, 31, 23, 59, 59, 999),
    createdByAccount: accountId,
  };
}
