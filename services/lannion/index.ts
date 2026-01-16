import { Attendance } from "@/services/shared/attendance";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { fetchLannionAttendance } from "./attendance";
import { fetchLannionGrades } from "./grades";
import { authenticateWithCredentials, LannionAPI, LannionClient } from "./module";
import { LannionSemestre } from "./module/types";

export class Lannion implements SchoolServicePlugin {
  displayName = "Lannion";
  service = Services.LANNION;
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.GRADES, Capabilities.ATTENDANCE];
  session: LannionClient | undefined;
  authData: Auth = {};
  
  private periods: Period[] = [];

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Lannion> {
    try {
      const username = credentials.additionals?.username as string;
      const password = credentials.additionals?.password as string;

      if (!username || !password) {
        throw new Error("Missing credentials for Lannion refresh");
      }

      const client = await authenticateWithCredentials(username, password);
      this.session = client;
      this.authData = credentials;

      const api = new LannionAPI(this.session);
      const result = await api.getSemestres();

      if (result.success && result.data) {
        this.periods = result.data.map((semestre: LannionSemestre) => {
          let id = semestre.formsemestre_id;
          if (!id) {
            if (semestre.semestre_id) {
              id = semestre.semestre_id;
            } else if (semestre.id && !isNaN(Number(semestre.id))) {
              id = Number(semestre.id);
            } else if (typeof semestre.id === 'string' && semestre.id.startsWith('Semestre')) {
              const match = semestre.id.match(/Semestre\s+(\d+)/);
              if (match) {
                id = Number(match[1]);
              } else {
                id = semestre.id as unknown as number;
              }
            } else {
              id = semestre.id as unknown as number;
            }
          }

          console.log(semestre);

          const startYear = semestre.annee_scolaire.split("/")[0];
          const endYear = semestre.annee_scolaire.split("/")[1];

          const partOfYear = Number(semestre.semestre_id) % 2;

          const estimatedDateDebut = new Date("2021-01-30");
          
          estimatedDateDebut.setFullYear(Number(startYear));
          estimatedDateDebut.setMonth(8);

          const estimatedDateFin = new Date("2021-01-30");
          estimatedDateFin.setFullYear(Number(endYear));
          estimatedDateFin.setMonth(0);

          if(partOfYear == 0) {
            estimatedDateDebut.setFullYear(Number(endYear));
            estimatedDateDebut.setMonth(0);
            estimatedDateFin.setFullYear(Number(endYear));
            estimatedDateFin.setMonth(6);
          }

          return {
            id: id!.toString(),
            name: `Semestre ${semestre.semestre_id}`,
            start: estimatedDateDebut,
            end: estimatedDateFin,
            createdByAccount: this.accountId,
          };
        });
      }

      return this;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      error(`Failed to refresh Lannion account: ${errorMessage}`, "Lannion.refreshAccount");
      throw e;
    }
  }

  async getSemestres() {
    if (!this.session) {
      error("Session is not valid", "Lannion.getSemestres");
      throw new Error("Session is not valid");
    }
    const api = new LannionAPI(this.session);
    return api.getSemestres();
  }

  async getInitialData() {
    if (!this.session) {
      error("Session is not valid", "Lannion.getInitialData");
      throw new Error("Session is not valid");
    }
    const api = new LannionAPI(this.session);
    return api.getInitialData();
  }

  async getAllReleves() {
    if (!this.session) {
      error("Session is not valid", "Lannion.getAllReleves");
      throw new Error("Session is not valid");
    }
    const api = new LannionAPI(this.session);
    return api.getAllReleves();
  }

  async getGradesPeriods(): Promise<Period[]> {
    return this.periods;
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    if (!this.session) {
      error("Session is not valid", "Lannion.getGradesForPeriod");
      throw new Error("Session is not valid");
    }
    return fetchLannionGrades(this.session, this.accountId, period);
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return this.getGradesPeriods();
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance> {
    if (!this.session) {
      error("Session is not valid", "Lannion.getAttendanceForPeriod");
      throw new Error("Session is not valid");
    }
    return fetchLannionAttendance(this.session, this.accountId, period);
  }
}
