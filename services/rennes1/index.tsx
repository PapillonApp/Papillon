import { Account, Session } from "pawdirecte";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Period, PeriodGrades } from "../shared/grade";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { refreshRennes1Account } from "./refresh";
import { fetchRennes1Grades } from "./grades";
import { fetchRennes1GradePeriods } from "./grades";

export class Rennes1 implements SchoolServicePlugin {
  displayName = "Rennes1";
  service = Services.RENNES1;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.GRADES,
  ];
  session: Session | undefined = undefined;
  account: Account | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) { }

  async refreshAccount(credentials: Auth): Promise<Rennes1> {
    const refresh = (await refreshRennes1Account(this.accountId, credentials))

    this.authData = refresh.auth
    this.account = refresh.account
    this.session = refresh.session

    return this;
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    if (this.authData && this.account) {
      return fetchRennes1Grades(this.authData, this.account, period)
    }

    error("Session or account is not valid", "Rennes1.getGradesForPeriod");
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (this.authData && this.account) {
      return fetchRennes1GradePeriods(this.authData, this.account);
    }

    error("Session or account is not valid", "Rennes1.getGradesPeriods");
  }
}