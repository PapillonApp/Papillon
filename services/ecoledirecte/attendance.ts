import { Client, SchoolLifeAttendanceItem,SchoolLifeAttendanceItemType, SchoolLifeConductItem } from "@blockshub/blocksdirecte";

import { error, warn } from "@/utils/logger/logger";

import { Absence, Attendance, Delay, Punishment } from "../shared/attendance";
import { durationToMinutes } from "../skolengo/attendance";

export async function fetchEDAttendance(session: Client, accountId: string): Promise<Attendance> {
  try {
    const attendance = await session.schoollife.getSchoolLife()
    const punishments = mapEcoleDirectePunishments(attendance.sanctionsEncouragements, accountId);
    const absences = mapEcoleDirecteAbsences(attendance.absencesRetards, accountId);
    const delays = mapEcoleDirecteDelays(attendance.absencesRetards, accountId);
    return {
      absences: absences,
      punishments,
      delays,
      observations: [],
      createdByAccount: accountId
    }
  } catch (error) {
    warn(String(error))
    return {
      absences: [],
      punishments: [],
      delays: [],
      observations: [],
      createdByAccount: accountId
    }
  }
}

function mapEcoleDirecteAbsences(data: SchoolLifeAttendanceItem[], accountId: string): Absence[] {
  return data
    .filter(item => item.typeElement === SchoolLifeAttendanceItemType.ABSENCE)
    .map(item => {
      const { start, end } = mapStringToDates(item.displayDate);
      return {
        id: String(item.id),
        from: start,
        to: end,
        reason: item.motif,
        justified: item.justifie,
        timeMissed: durationToMinutes(start.getTime(), end.getTime()),
        createdByAccount: accountId
      };
    });
}

function mapEcoleDirecteDelays(data: SchoolLifeAttendanceItem[], accountId: string): Delay[] {
  return data
    .filter(item => item.typeElement === SchoolLifeAttendanceItemType.DELAY)
    .map(item => {
      const { start, end } = mapStringToDates(item.displayDate);
      return {
        id: String(item.id),
        givenAt: new Date(item.date),
        reason: item.motif,
        justified: item.justifie,
        duration: durationToMinutes(start.getTime(), end.getTime()),
        createdByAccount: accountId
      };
    });
}

function mapEcoleDirectePunishments(data: SchoolLifeConductItem[], accountId: string): Punishment[] {
  return data.map(item => ({
    id: String(item.id),
    givenAt: new Date(item.dateDeroulement),
    givenBy: [item.auteur.prenom, item.auteur.nom].join(" "),
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
  }))
}

function mapStringToDates(str: string): { start: Date, end: Date } {
  const months: Record<string, number> = {
    "janvier": 1,
    "février": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "août": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "décembre": 12
  };

  if (str.includes("du")) {
    const splittedStr = str.split(" ");

    const duIndex = splittedStr.indexOf("du");
    const auIndex = splittedStr.indexOf("au");

    if (duIndex !== -1 && auIndex !== -1) {
      const dayStart = parseInt(splittedStr[duIndex + 2]);
      const monthStart = months[splittedStr[duIndex + 3]] ?? 0;
      const yearStart = parseInt(splittedStr[duIndex + 4]);

      const dayEnd = parseInt(splittedStr[auIndex + 2]);
      const monthEnd = months[splittedStr[auIndex + 3]] ?? 0;
      const yearEnd = parseInt(splittedStr[auIndex + 4]);

      const startDate = new Date(yearStart, monthStart - 1, dayStart);
      const endDate = new Date(yearEnd, monthEnd - 1, dayEnd);

      return {
        start: startDate,
        end: endDate
      }
    }
  }

  if (str.includes("le")) {
    const parts = str.split("à");
    let startDate: string;
    let endDate: string;

    if (!str.includes(":")) {
      startDate = `${parts[0].replace("le", "").trim()} de 00:00`;
      endDate = `${parts[0].split("de")[0].replace("le", "").trim()} de 23:59`;
    } else {
      startDate = parts[0].replace("le", "").trim();
      endDate = `${parts[0].split("de")[0].replace("le", "").trim()} de ${parts[1].trim()}`;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    return { start, end }
  }

  throw error("Invalid Display Date", "mapStringToDates");
}

function mapStringToDuration(str: string): number | undefined {
  const months: Record<string, number> = {
    "janvier": 1,
    "février": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "août": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "décembre": 12
  };

  if (str.includes("du")) {
    const splittedStr = str.split(" ");

    const duIndex = splittedStr.indexOf("du");
    const auIndex = splittedStr.indexOf("au");

    if (duIndex !== -1 && auIndex !== -1) {
      const dayStart = parseInt(splittedStr[duIndex + 2]);
      const monthStart = months[splittedStr[duIndex + 3]] ?? 0;
      const yearStart = parseInt(splittedStr[duIndex + 4]);

      const dayEnd = parseInt(splittedStr[auIndex + 2]);
      const monthEnd = months[splittedStr[auIndex + 3]] ?? 0;
      const yearEnd = parseInt(splittedStr[auIndex + 4]);

      const startDate = new Date(yearStart, monthStart - 1, dayStart);
      const endDate = new Date(yearEnd, monthEnd - 1, dayEnd);

      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24)) + 1;
      return durationDays;
    }
  }

  throw error("Invalid Display Date", "mapStringToDuration");
}