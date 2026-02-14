import { WebUntisClient } from "webuntis-client";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Homework } from "../shared/homework";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchWebUntisHomeworks } from "./homework";
import { refreshWebUntisAccount } from "./refresh";
import { fetchWebUntisWeekTimetable } from "./timetable";

export class WebUntis implements SchoolServicePlugin {
  displayName = "WebUntis";
  service = Services.WEBUNTIS;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session: WebUntisClient | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<WebUntis> {
    const refresh = await refreshWebUntisAccount(this.accountId, credentials);

    this.authData = refresh.auth;
    this.session = refresh.session;

    this.capabilities.push(Capabilities.TIMETABLE);
    this.capabilities.push(Capabilities.HOMEWORK);

    return this;
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    if (this.session) {
      return await fetchWebUntisWeekTimetable(
        this.session,
        this.accountId,
        weekNumber
      );
    }

    error("Session is not valid", "WebUntis.getWeeklyTimetable");
    return [];
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session) {
      return await fetchWebUntisHomeworks(
        this.session,
        this.accountId,
        weekNumber
      );
    }

    error("Session is not valid", "WebUntis.getHomeworks");
    return [];
  }
}
