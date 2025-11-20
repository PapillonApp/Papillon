// services/lannion/index.ts

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { Period, PeriodGrades } from "../shared/grade";
import { Kid } from "../shared/kid";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { LannionSession, refreshLannionAccount } from "./refresh";

export class Lannion implements SchoolServicePlugin {
  displayName = "IUT Lannion";
  service = Services.LANNION; // Assure-toi que LANNION existe dans l'enum Services
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.GRADES];

  session?: LannionSession;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<this> {
    try {
      const { auth, session } = await refreshLannionAccount(
        this.accountId,
        credentials
      );
      this.authData = auth;
      this.session = session;
      return this;
    } catch (err) {
      error("Erreur lors du refreshAccount", "Lannion.refreshAccount");
      throw err;
    }
  }

  async getGradesForPeriod(_period: Period, _kid?: Kid): Promise<PeriodGrades> {
    if (!this.session) {
      error("Session is not valide", "Lannion.getGradesForPeriod");
      throw new Error("Session is not valide");
    }
    return this.session.grades;
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (!this.session) {
      error("Session is not valide", "Lannion.getGradesPeriods");
      return [];
    }
    const semestres = this.session.userInfo?.semestres ?? [];
    if (!Array.isArray(semestres) || semestres.length === 0) {
      return [];
    }

    type Semestre = { formsemestre_id: string | number; libelle?: string };
    return semestres.map((sem: Semestre) => ({
      id: String(sem.formsemestre_id),
      name: sem.libelle ?? `Semestre ${sem.formsemestre_id}`,
    }));
  }

  async getAttendanceForPeriod(): Promise<Attendance> {
    return {
      absences: [],
      delays: [],
    };
  }
}
