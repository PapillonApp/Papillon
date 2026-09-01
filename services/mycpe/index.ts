import { Attendance } from "@/services/shared/attendance";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { CourseDay } from "@/services/shared/timetable";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";

import {
  MyCpeApiClient,
  MyCpeApiClientOptions,
  MyCpeAuthenticationError,
} from "./api";
import { fetchMyCpeAttendance } from "./attendance";
import { fetchMyCpeGrades } from "./grades";
import { MyCpeConfiguration } from "./models";
import { getMyCpeAcademicPeriod } from "./period";
import { fetchMyCpeTimetable } from "./timetable";
import { getMyCpeToken, MyCpeSecureStore } from "./token-storage";

export interface MyCpeProviderOptions extends Omit<
  MyCpeApiClientOptions,
  "token"
> {
  now?: () => Date;
  tokenStore?: MyCpeSecureStore;
}

export function getMyCpeCapabilities(
  configuration?: MyCpeConfiguration
): Capabilities[] {
  const visibility = configuration?.visibilite;
  const capabilities = [Capabilities.REFRESH];

  if (visibility?.["est_visible_mon_planning"] !== false) {
    capabilities.push(Capabilities.TIMETABLE);
  }
  if (visibility?.["est_visible_mes_notes"] !== false) {
    capabilities.push(Capabilities.GRADES);
  }
  if (visibility?.["est_visible_mes_absences"] !== false) {
    capabilities.push(Capabilities.ATTENDANCE, Capabilities.ATTENDANCE_PERIODS);
  }

  return capabilities;
}

export class MyCpe implements SchoolServicePlugin {
  displayName = "My CPE Lyon";
  service = Services.MYCPE;
  requiresInternet = true;
  capabilities: Capabilities[] = getMyCpeCapabilities();
  authData: Auth = {};
  session: MyCpeApiClient | undefined;
  configuration: MyCpeConfiguration | undefined;

  constructor(
    public accountId: string,
    private readonly options: MyCpeProviderOptions = {}
  ) {}

  async refreshAccount(credentials: Auth): Promise<MyCpe> {
    const usernameValue = credentials.additionals?.["username"];
    const username =
      typeof usernameValue === "string" ? usernameValue.trim() : "";
    this.authData = {
      additionals: username ? { username } : {},
    };
    this.session = undefined;
    this.configuration = undefined;

    const token = await getMyCpeToken(this.accountId, this.options.tokenStore);
    if (!token?.trim()) {
      throw new MyCpeAuthenticationError(
        "Le jeton de connexion My CPE est introuvable."
      );
    }

    const { now: _now, tokenStore: _tokenStore, ...apiOptions } = this.options;
    const client = new MyCpeApiClient({ ...apiOptions, token });
    const configuration = await client.getConfiguration();

    this.session = client;
    this.configuration = configuration;
    this.capabilities = getMyCpeCapabilities(configuration);
    return this;
  }

  async getConfiguration(): Promise<MyCpeConfiguration> {
    const configuration = await this.getSession().getConfiguration();
    this.configuration = configuration;
    this.capabilities = getMyCpeCapabilities(configuration);
    return configuration;
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    return fetchMyCpeTimetable(
      this.getSession(),
      this.accountId,
      weekNumber,
      date
    );
  }

  async getGradesPeriods(): Promise<Period[]> {
    return [
      getMyCpeAcademicPeriod(
        this.accountId,
        this.options.now?.() ?? new Date()
      ),
    ];
  }

  async getGradesForPeriod(_period: Period): Promise<PeriodGrades> {
    return fetchMyCpeGrades(this.getSession(), this.accountId);
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return [
      getMyCpeAcademicPeriod(
        this.accountId,
        this.options.now?.() ?? new Date()
      ),
    ];
  }

  async getAttendanceForPeriod(_period: string): Promise<Attendance> {
    return fetchMyCpeAttendance(this.getSession(), this.accountId);
  }

  private getSession(): MyCpeApiClient {
    if (!this.session) {
      throw new MyCpeAuthenticationError(
        "La session My CPE n'a pas été initialisée."
      );
    }
    return this.session;
  }
}

export { loginMyCpe } from "./api";
export {
  deleteMyCpeToken,
  getMyCpeToken,
  saveMyCpeToken,
} from "./token-storage";
