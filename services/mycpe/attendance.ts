import { Absence, Attendance } from "@/services/shared/attendance";

import { MyCpeApiClient } from "./api";
import { MyCpeAbsence, MyCpeAbsencesResponse } from "./models";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const text = value.trim();
  return text || undefined;
};

const parseDate = (value: unknown): Date | undefined => {
  const text = cleanText(value);
  if (!text) {
    return undefined;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const mapAbsence = (
  absence: MyCpeAbsence,
  accountId: string,
  index: number
): Absence | undefined => {
  const from = parseDate(absence.evenement?.["date_debut"]);
  const to = parseDate(absence.evenement?.["date_fin"]);
  if (!from || !to || to.getTime() <= from.getTime()) {
    return undefined;
  }

  return {
    id:
      absence.id === undefined || absence.id === null
        ? `mycpe-absence-${from.getTime()}-${index}`
        : String(absence.id),
    from,
    to,
    reason:
      cleanText(absence["motif_absence"]?.libelle) ??
      cleanText(absence.evenement?.["libelle_construit"]),
    justified: absence["motif_absence"]?.["est_excuser"] === true,
    timeMissed: (to.getTime() - from.getTime()) / (60 * 1000),
    createdByAccount: accountId,
  };
};

export function mapMyCpeAttendance(
  response: MyCpeAbsencesResponse,
  accountId: string
): Attendance {
  const absences = (Array.isArray(response.absences) ? response.absences : [])
    .map((absence, index) => mapAbsence(absence, accountId, index))
    .filter((absence): absence is Absence => absence !== undefined);

  return {
    createdByAccount: accountId,
    absences,
    delays: [],
    punishments: [],
    observations: [],
  };
}

export async function fetchMyCpeAttendance(
  client: MyCpeApiClient,
  accountId: string
): Promise<Attendance> {
  return mapMyCpeAttendance(await client.getAbsences(), accountId);
}
