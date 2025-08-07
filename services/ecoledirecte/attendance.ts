import { Account, AttendanceItem, Session, studentAttendance } from "pawdirecte";

import { error } from "@/utils/logger/logger";

import { Absence, Attendance, Punishment } from "../shared/attendance";

export async function fetchEDAttendance(session: Session, account: Account, accountId: string): Promise<Attendance> {
  const attendance = await studentAttendance(session, account);
  const punishments = mapEcoleDirectePunishments(attendance.punishments);
  const exemptions = mapEcoleDirectePunishments(attendance.exemptions);
  const absences = mapEcoleDirecteAbsences(attendance.absences);
  return {
    absences: absences,
    punishments: [...punishments, ...exemptions],
    delays: [],
    observations: [],
    createdByAccount: accountId
  }
}

function mapEcoleDirecteAbsences(data: AttendanceItem[]): Absence[] {
  return data.map(item => {
    const { start, end } = mapStringToDates(item.displayDate);
    return {
      id: String(item.id),
      from: start,
      to: end,
      reason: item.reason,
      justified: item.justified
    };
  });
}

function mapEcoleDirectePunishments(data: AttendanceItem[]): Punishment[] {
  return data.map(item => ({
    id: String(item.id),
    givenAt: item.dateOfEvent,
    givenBy: item.teacher,
    exclusion: false,
    duringLesson: false,
    homework: {
      text: item.todo,
      documents: []
    },
    reason: {
      text: item.reason,
      circumstances: item.reason,
      documents: []
    },
    nature: "",
    duration: mapStringToDuration(item.displayDate) ?? 0,
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

  error("Invalid Display Date", "mapStringToDuration");
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

  error("Invalid Display Date", "mapStringToDuration");
}