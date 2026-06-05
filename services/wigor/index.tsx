import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { User } from "@studentsphere/linkgor";
import { refreshWigorAccount } from "./refresh";
import { error, warn } from "@/utils/logger/logger";
import { CourseDay } from "@/services/shared/timetable";
import { fetchWigorTimetable } from "@/services/wigor/timetable";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Attendance } from "@/services/shared/attendance";

export class Wigor implements SchoolServicePlugin {
  displayName = "Wigor";
  service = Services.WIGOR;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.TIMETABLE,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
    Capabilities.GRADES,
  ];
  session: User | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Wigor> {
    try {
      const refresh = await refreshWigorAccount(this.accountId, credentials);
      
      this.authData = refresh.auth;
      this.session = refresh.session;

      return this;
    } catch (refreshError) {
      error(`Failed to refresh Wigor account: ${refreshError}`, "Wigor.refreshAccount");
      throw refreshError;
    }
  }

  async getWeeklyTimetable(weekNumber: number, date: Date, forceRefresh?: boolean): Promise<CourseDay[]> {
    if (this.session) {
      const instanceId = String(this.authData.additionals?.["instanceId"]);
      return fetchWigorTimetable(this.session, this.accountId, weekNumber, instanceId, forceRefresh);
    }

    error("Session is not valid", "Wigor.getWeeklyTimetable");
    throw new Error("Session is not valid");
  }

  async getGradesPeriods(): Promise<Period[]> {
    const currentYear = new Date().getFullYear();
    return [
      {
        name: "Semestre",
        createdByAccount: this.accountId,
        start: new Date(currentYear - 1, 8, 1),
        end: new Date(currentYear + 1, 6, 31),
      }
    ];
  }

  async getGradesForPeriod(period: Period, kid?: any): Promise<PeriodGrades> {
    return {
      createdByAccount: this.accountId,
      studentOverall: { value: 0, disabled: true },
      classAverage: { value: 0, disabled: true },
      subjects: [],
    };
  }

  async getAttendancePeriods(): Promise<Period[]> {
    const currentYear = new Date().getFullYear();
    return [
      {
        name: "Semestre",
        createdByAccount: this.accountId,
        start: new Date(currentYear - 1, 8, 1),
        end: new Date(currentYear + 1, 6, 31),
      }
    ];
  }

  async getAttendanceForPeriod(period: string): Promise<any> {
    return {
      createdByAccount: this.accountId,
      delays: [],
      absences: [],
      punishments: [],
      observations: [],
    };
  }
}
