import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";

import { refreshWebUntisAccount } from "./refresh";
import { WebUntisClient } from "webuntis-client";
import { Attendance } from "@/services/shared/attendance";
import { error } from "@/utils/logger/logger";
import { fetchWebUntisAttendance } from "@/services/webuntis/attendance";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { fetchWebUntisPeriods } from "@/services/webuntis/periods";
import { fetchWebUntisHomeworks } from "@/services/webuntis/homework";
import { Homework } from "@/services/shared/homework";

export class WebUntis implements SchoolServicePlugin {
  displayName = "WebUntis";
  service = Services.WEBUNTIS;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
    Capabilities.GRADES,
    Capabilities.TIMETABLE,
    Capabilities.HOMEWORK,
  ];
  session: WebUntisClient | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {
  }

  async refreshAccount(credentials: Auth): Promise<WebUntis> {
    const refresh = await refreshWebUntisAccount(this.accountId, credentials);

    this.authData = refresh.auth;
    this.session = refresh.client;

    return this;
  }

  async getAttendancePeriods(): Promise<Period[]> {
    if ( this.session ) {
      return fetchWebUntisPeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getAttendancePeriods");
    return [];
  }

  async getAttendanceForPeriod(): Promise<Attendance> {
    if ( this.session ) {
      return fetchWebUntisAttendance(this.session, this.accountId);
    }

    error("Session or account is not valid", "WebUntis.getAttendanceForPeriod");

    return {
      createdByAccount: this.accountId,
      observations: [],
      punishments: [],
      absences: [],
      delays: [],
    }
  }

  async getGradesForPeriod(): Promise<PeriodGrades> {
    return {
      createdByAccount: this.accountId,
      studentOverall: { value: 0 },
      classAverage: { value: 0 },
      subjects: [],
    };
  }

  async getGradesPeriods(): Promise<Period[]> {
    if ( this.session ) {
      return fetchWebUntisPeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getGradesPeriods");
    return [];
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if ( this.session ) {
      return fetchWebUntisHomeworks(this.session, this.accountId, weekNumber);
    }

    error("Session or account is not valid", "WebUntis.getHomeworks");
    return [];
  }

  // async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
  //   if ( this.session ) {
  //     return fetchEDTimetable(this.session, this.accountId, weekNumber)
  //   }
  //
  //   error("Session or account is not valid", "WebUntis.getWeeklyTimetable")
  // }
}