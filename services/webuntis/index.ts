import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";

import { refreshWebUntisAccount } from "./refresh";
import { WebUntisClient } from "webuntis-client";

export class WebUntis implements SchoolServicePlugin {
  displayName = "WebUntis";
  service = Services.WEBUNTIS;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.ATTENDANCE,
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
    this.session = refresh.session;

    return this;
  }

  // async getHomeworks(weekNumber: number): Promise<Homework[]> {
  //   if ( this.session ) {
  //     return fetchEDHomeworks(this.session, this.accountId, weekNumber);
  //   }
  //
  //   error("Session or account is not valid", "WebUntis.getHomeworks")
  // }
  //
  // async getAttendanceForPeriod(): Promise<Attendance> {
  //   if ( this.session ) {
  //     return fetchEDAttendance(this.session, this.accountId);
  //   }
  //
  //   error("Session or account is not valid", "WebUntis.getAttendanceForPeriod");
  // }
  //
  // async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
  //   if ( this.session ) {
  //     return fetchEDTimetable(this.session, this.accountId, weekNumber)
  //   }
  //
  //   error("Session or account is not valid", "WebUntis.getWeeklyTimetable")
  // }
}