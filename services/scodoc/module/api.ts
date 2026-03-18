import { error } from '@/utils/logger/logger';

import { ScodocClient } from './client';
import { ApiResponse, ScodocEtudiant, ScodocFormsemestre, ScodocReleve } from './types';

export class ScodocAPI {
  constructor(private client: ScodocClient) {}

  /**
   * Search for the current student by NIP (user_name).
   * GET /ScoDoc/api/etudiants/search?nip={nip}
   */
  async searchEtudiantByNip(nip: string): Promise<ApiResponse<ScodocEtudiant[]>> {
    try {
      const data = await this.client.get<ScodocEtudiant[]>('/ScoDoc/api/etudiants/search', { nip });
      return { success: true, data };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`[ScodocAPI] searchEtudiantByNip failed: ${msg}`, 'ScodocAPI');
      return { success: false, error: msg };
    }
  }

  /**
   * Get the list of formsemestres for a given etudid.
   * GET /ScoDoc/api/etudiant/etudid/{etudid}/formsemestres
   */
  async getFormsemestres(etudid: number): Promise<ApiResponse<ScodocFormsemestre[]>> {
    try {
      const data = await this.client.get<ScodocFormsemestre[]>(
        `/ScoDoc/api/etudiant/etudid/${etudid}/formsemestres`
      );
      return { success: true, data };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`[ScodocAPI] getFormsemestres failed: ${msg}`, 'ScodocAPI');
      return { success: false, error: msg };
    }
  }

  /**
   * Get the bulletin (relevé de notes) for a given student and semester.
   * GET /ScoDoc/{dept}/api/1/etudiant/{etudid}/bulletin?formsemestre_id={id}
   */
  async getBulletin(
    deptAcronym: string,
    etudid: number,
    formsemestreId: number
  ): Promise<ApiResponse<ScodocReleve>> {
    try {
      const data = await this.client.get<ScodocReleve>(
        `/ScoDoc/${deptAcronym}/api/1/etudiant/${etudid}/bulletin`,
        { formsemestre_id: String(formsemestreId) }
      );
      return { success: true, data };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`[ScodocAPI] getBulletin failed: ${msg}`, 'ScodocAPI');
      return { success: false, error: msg };
    }
  }

  /**
   * Get absences for a student in a given semester.
   * GET /ScoDoc/{dept}/api/1/etudiant/{etudid}/absences?formsemestre_id={id}
   */
  async getAbsences(
    deptAcronym: string,
    etudid: number,
    formsemestreId: number
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.client.get<Record<string, unknown>>(
        `/ScoDoc/${deptAcronym}/api/1/etudiant/${etudid}/absences`,
        { formsemestre_id: String(formsemestreId) }
      );
      return { success: true, data };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`[ScodocAPI] getAbsences failed: ${msg}`, 'ScodocAPI');
      return { success: false, error: msg };
    }
  }

  /**
   * Discover student info: search by username (NIP), get etudid and dept.
   * Returns the first matching student.
   */
  async discoverStudent(username: string): Promise<ApiResponse<{ etudid: number; deptAcronym: string; etudiant: ScodocEtudiant }>> {
    const searchResult = await this.searchEtudiantByNip(username);
    if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
      return { success: false, error: 'Student not found for username: ' + username };
    }

    const etudiant = searchResult.data[0];
    const etudid = etudiant.etudid;
    const deptAcronym = etudiant.dept_acronym || '';

    if (!deptAcronym) {
      // Try to get dept from formsemestres
      const semResult = await this.getFormsemestres(etudid);
      if (semResult.success && semResult.data && semResult.data.length > 0) {
        const firstSem = semResult.data[semResult.data.length - 1];
        return {
          success: true,
          data: { etudid, deptAcronym: firstSem.dept_acronym || '', etudiant }
        };
      }
    }

    return { success: true, data: { etudid, deptAcronym, etudiant } };
  }
}
