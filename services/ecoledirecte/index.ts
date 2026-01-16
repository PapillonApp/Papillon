import { Client } from "@blockshub/blocksdirecte";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { Period, PeriodGrades } from "../shared/grade";
import { Homework } from "../shared/homework";
import { News } from "../shared/news";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchEDAttendance } from "./attendance";
import { fetchEDGradePeriods, fetchEDGrades } from "./grades";
import { fetchEDHomeworks, setEDHomeworkAsDone } from "./homework";
import { fetchEDNews } from "./news";
import { refreshEDAccount } from "./refresh";
import { fetchEDTimetable } from "./timetable";

export class EcoleDirecte implements SchoolServicePlugin {
  displayName = "EcoleDirecte";
  service = Services.ECOLEDIRECTE;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH, 
    Capabilities.NEWS, 
    Capabilities.ATTENDANCE, 
    Capabilities.GRADES,
    Capabilities.HOMEWORK,
    Capabilities.TIMETABLE
  ];
  session: Client | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<EcoleDirecte> {
    const refresh = (await refreshEDAccount(this.accountId, credentials))

    this.authData = refresh.auth
    this.session = refresh.account

    return this;
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session) {
      return fetchEDHomeworks(this.session, this.accountId, weekNumber);
    }

    throw error("Session or account is not valid", "EcoleDirecte.getHomeworks")
  }

  async getNews(): Promise<News[]> {
    if (this.session) {
      return fetchEDNews(this.session, this.accountId);
    }

    throw error("Session or account is not valid", "EcoleDirecte.getNews");
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    if (this.session) {
      return fetchEDGrades(this.session, this.accountId, period)
    }
		
    throw error("Session or account is not valid", "EcoleDirecte.getGradesForPeriod");
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (this.session) {
      return fetchEDGradePeriods(this.session, this.accountId)
    }
		
    throw error("Session or account is not valid", "EcoleDirecte.getGradesPeriods");
  }

  async getAttendanceForPeriod(): Promise<Attendance> {
    if (this.session) {
      return fetchEDAttendance(this.session, this.accountId);
    }

    throw error("Session or account is not valid", "EcoleDirecte.getAttendanceForPeriod");
  }

  async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    if (this.session) {
      return fetchEDTimetable(this.session, this.accountId, weekNumber)
    }

    throw error("Session or account is not valid", "EcoleDirecte.getWeeklyTimetable")
  }

  async setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    if (this.session) {
      return setEDHomeworkAsDone(this.session, homework, state)
    }

    throw error("Session or account is not valid", "EcoleDirecte.setHomeworkCompletion");
  }
}