import { WebUntisClient } from "webuntis-client";

import { Auth, Services } from "@/stores/account/types";

import { Homework } from "../shared/homework";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchWebUntisHomeworks } from "./homework";
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

    return this;
  }

  // Timetable

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    return fetchWebUntisWeekTimetable(
      this.session!,
      this.accountId,
      weekNumber
    );
  }

  // Homeworks

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    return fetchWebUntisHomeworks(this.session!, this.accountId, weekNumber);
  }
}
