import { LinksignClient } from "@studentsphere/linksign";
import { error } from "@/utils/logger/logger";
import { Attendance, Absence } from "../shared/attendance";

export async function fetchEdusignAttendance(
  client: LinksignClient,
  accountId: string,
  periodId: string
): Promise<Attendance> {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 6, 0).toISOString();

    const courses = await client.getCoursesBetweenDates(start, end);
    const requests = await client.getAbsences(start, end);

    const absences: Absence[] = requests.map(abs => {
      const fromDate = new Date(abs.start);
      const toDate = new Date(abs.end);
      return {
        id: abs.id || Math.random().toString(),
        from: fromDate,
        to: toDate,
        reason: abs.reasonLabel || (abs.ia ? abs.ia.reason : undefined),
        justified: abs.status === "accepted" || abs.status === "pending",
        timeMissed: (toDate.getTime() - fromDate.getTime()) / (1000 * 60),
        createdByAccount: accountId,
      };
    });

    const delays: any[] = [];

    const nowTime = now.getTime();

    for (const c of courses) {
      if (c.data_type !== "attendance_sheet") continue;

      const endTime = new Date(c.END).getTime();
      const startTime = new Date(c.START).getTime();

      if (!c.STUDENT_PRESENCE && !c.WAITING && endTime < nowTime) {
        const request = requests.find(r => {
          if (r.sessions?.includes(c.ID)) return true;
          const rStart = new Date(r.start).getTime();
          const rEnd = new Date(r.end).getTime();
          return startTime >= rStart && endTime <= rEnd;
        });

        if (!request) {
          absences.push({
            id: c.ID,
            from: new Date(c.START),
            to: new Date(c.END),
            reason: c.COMMENT || undefined,
            justified: c.JUSTIFIED || c.STUDENT_IS_JUSTIFICATED,
            timeMissed: (endTime - startTime) / (1000 * 60), // in minutes
            createdByAccount: accountId,
          });
        }
      }

      if (c.DELAY && c.DELAY > 0) {
        delays.push({
          id: c.ID + "_delay",
          givenAt: new Date(c.START),
          reason: c.COMMENT || undefined,
          justified: c.JUSTIFIED || c.STUDENT_IS_JUSTIFICATED,
          duration: c.DELAY, // usually in minutes
          createdByAccount: accountId,
        });
      }
    }

    return {
      absences,
      delays,
      punishments: [],
      observations: [],
      createdByAccount: accountId,
    };
  } catch (err) {
    error("Failed to fetch Edusign attendance", "Edusign.fetchEdusignAttendance");
    throw err;
  }
}
