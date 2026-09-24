import { Client, SchoolLifeAttendanceItem, SchoolLifeAttendanceItemType, SchoolLifeConductItem } from "@blockshub/blocksdirecte";

import { warn } from "@/utils/logger/logger";

import { Absence, Attendance, Delay, Punishment } from "../shared/attendance";
import { Period } from "../shared/grade";
import { durationToMinutes } from "../skolengo/attendance";
import { fetchEDGradePeriods } from "./grades";

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
};

export async function fetchEDAttendance(session: Client, accountId: string, periodName?: string): Promise<Attendance> {
  try {
    const attendance = await session.schoollife.getSchoolLife();
    const selectedPeriod = periodName
      ? await getSelectedPeriod(session, accountId, periodName)
      : undefined;
    const schoolLifeItems = filterAttendanceItemsByPeriod(attendance.absencesRetards, selectedPeriod);
    const conductItems = filterConductItemsByPeriod(attendance.sanctionsEncouragements, selectedPeriod);

    return {
      absences: mapEcoleDirecteAbsences(schoolLifeItems, accountId),
      punishments: mapEcoleDirectePunishments(conductItems, accountId),
      delays: mapEcoleDirecteDelays(schoolLifeItems, accountId),
      observations: [],
      createdByAccount: accountId
    };
  } catch (error) {
    warn(String(error));
    return {
      absences: [],
      punishments: [],
      delays: [],
      observations: [],
      createdByAccount: accountId
    };
  }
}

export async function fetchEDAttendancePeriods(session: Client, accountId: string): Promise<Period[]> {
  const periods = await fetchEDGradePeriods(session, accountId);

  return periods.filter(period => {
    const normalized = normalizeLabel(period.name);
    return normalized.length > 0
      && !normalized.startsWith("releve")
      && normalized !== "annee";
  });
}

function mapEcoleDirecteAbsences(data: SchoolLifeAttendanceItem[], accountId: string): Absence[] {
  return data
    .filter(item => item.typeElement === SchoolLifeAttendanceItemType.ABSENCE)
    .flatMap(item => {
      try {
        const { start, end } = mapStringToDates(item.displayDate);
        return [{
          id: String(item.id),
          from: start,
          to: end,
          reason: item.motif,
          justified: item.justifie,
          timeMissed: durationToMinutes(start.getTime(), end.getTime()),
          createdByAccount: accountId
        }];
      } catch (error) {
        warn(`Skipping invalid ED absence ${String(item.id)}: ${String(error)}`, "mapEcoleDirecteAbsences");
        return [];
      }
    });
}

function mapEcoleDirecteDelays(data: SchoolLifeAttendanceItem[], accountId: string): Delay[] {
  return data
    .filter(item => item.typeElement === SchoolLifeAttendanceItemType.DELAY)
    .flatMap(item => {
      try {
        const { start, end } = mapStringToDates(item.displayDate);
        return [{
          id: String(item.id),
          givenAt: parseFlexibleDate(item.date) ?? start,
          reason: item.motif,
          justified: item.justifie,
          duration: durationToMinutes(start.getTime(), end.getTime()),
          createdByAccount: accountId
        }];
      } catch (error) {
        warn(`Skipping invalid ED delay ${String(item.id)}: ${String(error)}`, "mapEcoleDirecteDelays");
        return [];
      }
    });
}

function mapEcoleDirectePunishments(data: SchoolLifeConductItem[], accountId: string): Punishment[] {
  return data.flatMap(item => {
    const givenAt = parseFlexibleDate(item.dateDeroulement);

    if (!givenAt) {
      warn(`Skipping invalid ED punishment ${String(item.id)}: invalid date`, "mapEcoleDirectePunishments");
      return [];
    }

    return [{
      id: String(item.id),
      givenAt,
      givenBy: [item.auteur.prenom, item.auteur.nom].join(" ").trim(),
      exclusion: false,
      duringLesson: false,
      homework: {
        text: item.aFaire,
        documents: []
      },
      reason: {
        text: item.motif,
        circumstances: item.commentaire,
        documents: []
      },
      nature: "",
      duration: mapStringToDuration(item.displayDate) ?? 0,
      createdByAccount: accountId
    }];
  });
}

function mapStringToDates(str: string): { start: Date, end: Date } {
  const normalized = normalizeFrenchText(str);
  const rangeMatch = normalized.match(/^du [^ ]+ (\d{1,2}) ([^ ]+) (\d{4}) au [^ ]+ (\d{1,2}) ([^ ]+) (\d{4})$/i);

  if (rangeMatch) {
    return {
      start: createFrenchDate(rangeMatch[1], rangeMatch[2], rangeMatch[3], "00:00"),
      end: createFrenchDate(rangeMatch[4], rangeMatch[5], rangeMatch[6], "23:59")
    };
  }

  const singleDayMatch = normalized.match(/^le [^ ]+ (\d{1,2}) ([^ ]+) (\d{4})(?: de (\d{2}:\d{2}) a (\d{2}:\d{2}))?$/i);

  if (singleDayMatch) {
    return {
      start: createFrenchDate(singleDayMatch[1], singleDayMatch[2], singleDayMatch[3], singleDayMatch[4] ?? "00:00"),
      end: createFrenchDate(singleDayMatch[1], singleDayMatch[2], singleDayMatch[3], singleDayMatch[5] ?? "23:59")
    };
  }

  throw new Error(`Invalid display date: ${str}`);
}

function mapStringToDuration(str: string): number | undefined {
  try {
    const { start, end } = mapStringToDates(str);
    const durationMs = end.getTime() - start.getTime();
    return Math.floor(durationMs / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return undefined;
  }
}

async function getSelectedPeriod(session: Client, accountId: string, periodName: string): Promise<Period | undefined> {
  const periods = await fetchEDAttendancePeriods(session, accountId);
  return periods.find(period => period.name === periodName);
}

function filterAttendanceItemsByPeriod(
  items: SchoolLifeAttendanceItem[],
  selectedPeriod?: Period
): SchoolLifeAttendanceItem[] {
  if (!selectedPeriod) {
    return items;
  }

  return items.filter(item => isDateWithinPeriod(parseFlexibleDate(item.date), selectedPeriod));
}

function filterConductItemsByPeriod(
  items: SchoolLifeConductItem[],
  selectedPeriod?: Period
): SchoolLifeConductItem[] {
  if (!selectedPeriod) {
    return items;
  }

  return items.filter(item => isDateWithinPeriod(parseFlexibleDate(item.dateDeroulement), selectedPeriod));
}

function isDateWithinPeriod(date: Date | undefined, period: Period): boolean {
  if (!date || Number.isNaN(date.getTime())) {
    return false;
  }

  const periodStart = new Date(period.start.getFullYear(), period.start.getMonth(), period.start.getDate(), 0, 0, 0, 0);
  const periodEnd = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate(), 23, 59, 59, 999);

  return date.getTime() >= periodStart.getTime() && date.getTime() <= periodEnd.getTime();
}

function parseFlexibleDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateOnly) {
    const parsed = new Date(
      Number(isoDateOnly[1]),
      Number(isoDateOnly[2]) - 1,
      Number(isoDateOnly[3]),
      0,
      0,
      0,
      0
    );
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const slashDate = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashDate) {
    const parsed = new Date(
      Number(slashDate[3]),
      Number(slashDate[2]) - 1,
      Number(slashDate[1]),
      0,
      0,
      0,
      0
    );
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function createFrenchDate(day: string, month: string, year: string, time: string): Date {
  const normalizedMonth = normalizeLabel(month);
  const monthIndex = FRENCH_MONTHS[normalizedMonth];

  if (monthIndex === undefined) {
    throw new Error(`Unsupported french month: ${month}`);
  }

  const [hours, minutes] = time.split(":").map(Number);
  const parsed = new Date(Number(year), monthIndex, Number(day), hours, minutes, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid french date: ${day} ${month} ${year} ${time}`);
  }

  return parsed;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeFrenchText(value: string): string {
  return normalizeWhitespace(normalizeLabel(value));
}

function normalizeLabel(value: string): string {
  return repairMojibake(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function repairMojibake(value: string): string {
  return value
    .replace(/Ã©/g, "e")
    .replace(/Ã¨/g, "e")
    .replace(/Ãª/g, "e")
    .replace(/Ã«/g, "e")
    .replace(/Ã /g, "a")
    .replace(/Ã¢/g, "a")
    .replace(/Ã¹/g, "u")
    .replace(/Ã»/g, "u")
    .replace(/Ã´/g, "o")
    .replace(/Ã¶/g, "o")
    .replace(/Ã¯/g, "i")
    .replace(/Ã®/g, "i")
    .replace(/Ã§/g, "c")
    .replace(/Å“/g, "oe")
    .replace(/’/g, "'")
    .replace(/`/g, "'");
}
