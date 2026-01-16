import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { User } from "appscho";
import { refreshAppSchoAccount } from "./refresh";
import { error } from "@/utils/logger/logger";
import { CourseDay } from "@/services/shared/timetable";
import { fetchAppschoTimetable } from "@/services/appscho/timetable";
import { News } from "@/services/shared/news";
import { fetchAppschoNews } from "@/services/appscho/news";

export class Appscho implements SchoolServicePlugin {
  displayName = "AppScho";
  service = Services.APPSCHO;
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.TIMETABLE, Capabilities.NEWS];
  session: User | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Appscho> {
    try {
      const refresh = await refreshAppSchoAccount(this.accountId, credentials);
      
      this.authData = refresh.auth;
      this.session = refresh.session;
      
      return this;
    } catch (refreshError) {
      error(`Failed to refresh AppScho account: ${refreshError}`, "Appscho.refreshAccount");
      throw refreshError;
    }
  }

  async getWeeklyTimetable(weekNumber: number, date: Date, forceRefresh?: boolean): Promise<CourseDay[]> {
    if (this.session) {
      const instanceId = String(this.authData.additionals?.["instanceId"]);
      return fetchAppschoTimetable(this.session, this.accountId, weekNumber, instanceId, forceRefresh);
    }

    error("Session is not valid", "Appscho.getWeeklyTimetable");
  }

  async getNews(): Promise<News[]> {

    if (this.session) {
      const instanceId = String(this.authData.additionals?.["instanceId"]);
      return fetchAppschoNews(this.session, this.accountId, instanceId);
    }

    error("Session is not valid", "Appscho.getNews");
  }
}