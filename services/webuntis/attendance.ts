import { Absence, Attendance } from "@/services/shared/attendance";
import { Period } from "@/services/shared/grade";
import { Absence as WebUntisAbsence, WebUntisClient } from "webuntis-client";

export async function fetchWebUntisAttendance(client: WebUntisClient, accountId: string): Promise<Attendance> {
  const data = await client.data.get();
  const currentSchoolYear = data.currentSchoolYear;

  const start = new Date(currentSchoolYear.dateRange.start);
  const end = new Date(currentSchoolYear.dateRange.end);

  const absences = await client.absences.get({ start, end });
  const mappedAbsences = mapAbsences(absences, accountId).sort((a, b) => a.from.getTime() - b.from.getTime());

  return {
    createdByAccount: accountId,
    absences: mappedAbsences,
    observations: [],
    punishments: [],
    delays: [],
  }
}

export async function fetchWebUntisAttendancePeriods(client: WebUntisClient, accountId: string): Promise<Period[]> {
  const data = await client.data.get();
  const currentSchoolYear = data.currentSchoolYear;

  const start = new Date(currentSchoolYear.dateRange.start);
  const end = new Date(currentSchoolYear.dateRange.end);

  return [{
    id: currentSchoolYear.id.toString(),
    name: currentSchoolYear.name,
    start: start,
    end: end,
    createdByAccount: accountId
  }];
}

function mapAbsences(absences: WebUntisAbsence[], accountId: string): Absence[] {
  return absences.map(a => {
    const totalMinutes = (a.end.getTime() - a.start.getTime()) / (1000 * 60);

    return ({
      id: a.id,
      from: a.start,
      to: a.end,
      reason: a.reason,
      justified: a.isExcused,
      timeMissed: totalMinutes,
      createdByAccount: accountId
    });
  });
}