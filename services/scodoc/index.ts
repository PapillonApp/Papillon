import { Attendance } from '@/services/shared/attendance';
import { Period, PeriodGrades } from '@/services/shared/grade';
import { Capabilities, SchoolServicePlugin } from '@/services/shared/types';
import { Auth, Services } from '@/stores/account/types';
import { error } from '@/utils/logger/logger';

import { fetchScodocAttendance } from './attendance';
import { fetchScodocGrades } from './grades';
import { authenticateWithCredentials, ScodocAPI, ScodocClient } from './module';
import { ScodocFormsemestre } from './module/types';

export class Scodoc implements SchoolServicePlugin {
  displayName = 'ScoDoc';
  service = Services.SCODOC;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.GRADES,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
  ];
  session: ScodocClient | undefined;
  authData: Auth = {};

  private periods: Period[] = [];
  private etudid: number = 0;
  private deptAcronym: string = '';

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Scodoc> {
    try {
      const username = credentials.additionals?.username as string;
      const password = credentials.additionals?.password as string;
      const baseUrl = credentials.additionals?.baseUrl as string;

      if (!username || !password || !baseUrl) {
        throw new Error('Missing credentials (username, password, baseUrl) for ScoDoc refresh');
      }

      const client = await authenticateWithCredentials(baseUrl, username, password);
      this.session = client;
      this.authData = credentials;

      const api = new ScodocAPI(client);

      // Discover student info from the API
      const discoveryResult = await api.discoverStudent(username);

      if (!discoveryResult.success || !discoveryResult.data) {
        throw new Error(discoveryResult.error || 'Failed to find student in ScoDoc');
      }

      const { etudid, deptAcronym } = discoveryResult.data;
      this.etudid = etudid;
      this.deptAcronym = deptAcronym;

      client.setStudentInfo(etudid, deptAcronym);

      // Fetch semesters
      const semestresResult = await api.getFormsemestres(etudid);

      if (semestresResult.success && semestresResult.data) {
        this.periods = semestresResult.data.map((s: ScodocFormsemestre) => {
          const startYear = s.annee_scolaire?.split('/')?.[0] || new Date().getFullYear().toString();
          const endYear = s.annee_scolaire?.split('/')?.[1] || String(Number(startYear) + 1);

          return {
            id: s.formsemestre_id.toString(),
            name: s.titre || `Semestre ${s.semestre_id}`,
            start: s.date_debut ? new Date(s.date_debut) : new Date(`${startYear}-09-01`),
            end: s.date_fin ? new Date(s.date_fin) : new Date(`${endYear}-06-30`),
            createdByAccount: this.accountId,
          };
        });
      }

      return this;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`Failed to refresh ScoDoc account: ${msg}`, 'Scodoc.refreshAccount');
      throw e;
    }
  }

  async getGradesPeriods(): Promise<Period[]> {
    return this.periods;
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    if (!this.session || !this.etudid || !this.deptAcronym) {
      throw new Error('ScoDoc session not initialized');
    }
    return fetchScodocGrades(this.session, this.etudid, this.deptAcronym, this.accountId, period);
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return this.periods;
  }

  async getAttendanceForPeriod(periodId: string): Promise<Attendance> {
    if (!this.session || !this.etudid || !this.deptAcronym) {
      throw new Error('ScoDoc session not initialized');
    }
    return fetchScodocAttendance(this.session, this.etudid, this.deptAcronym, this.accountId, periodId);
  }
}
