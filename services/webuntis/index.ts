import { WebUntisClient } from "webuntis-client";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Period } from "../shared/grade";
import { Homework } from "../shared/homework";
import { News } from "../shared/news";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { getCurrentWebUntisPeriod } from "./attendance";
import { fetchWebUntisHomeworks } from "./homework";
import { fetchWebUntisNews } from "./news";
import { refreshWebUntisAccount } from "./refresh";
import { fetchWebUntisWeekTimetable } from "./timetable";

export class WebUntisService implements SchoolServicePlugin {
  displayName = "WebUntis";
  service = Services.WEBUNTIS;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session: WebUntisClient | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<WebUntisService> {
    const refresh = await refreshWebUntisAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;

    this.capabilities.push(Capabilities.TIMETABLE);
    this.capabilities.push(Capabilities.HOMEWORK);
    this.capabilities.push(Capabilities.NEWS);

    return this;
  }

  // Timetable

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    if (this.session?.isAuthenticated()) {
      return fetchWebUntisWeekTimetable(this.session, this.accountId, date);
    }

    error("Session is not valid", "WebUntis.getWeeklyTimetable");
    return [];
  }

  // Homeworks

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session?.isAuthenticated()) {
      return fetchWebUntisHomeworks(this.session, this.accountId, weekNumber);
    }

    error("Session is not valid", "WebUntis.getHomeworks");
    return [];
  }

  // Attendance

  async getAttendancePeriods(): Promise<Period[]> {
    return [getCurrentWebUntisPeriod()];
  }

  // News

  async getNews(): Promise<News[]> {
    if (this.session?.isAuthenticated()) {
      return fetchWebUntisNews(this.session, this.accountId);
    }

    error("Session is not valid", "WebUntis.getNews");
    return [];
  }
}
