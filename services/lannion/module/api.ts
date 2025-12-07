import { fetch } from 'expo-fetcher';

import { error } from '@/utils/logger/logger';

import { LannionClient } from './client';
import { ApiResponse, InitialData,Releve, Semestre } from './types';

const SERVICE_URL = 'https://notes9.iutlan.univ-rennes1.fr/services/data.php';

export class LannionAPI {
  constructor(private client: LannionClient) {}

  private async request<T>(query: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = `${SERVICE_URL}?q=${encodeURIComponent(query)}`;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
    }

    const session = this.client.getSession();
    const headers: Record<string, string> = {};
    if (session.phpSessionId && session.phpSessionId !== 'unknown') {
      headers['Cookie'] = `PHPSESSID=${session.phpSessionId}`;
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (response.status !== 200) {
        const errorText = await response.text();
        error(`[LannionAPI] Error response body: ${errorText || '<empty body>'}`, 'LannionAPI.request');
        return {
          success: false,
          error: `API request failed: ${response.status}`,
        };
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data && typeof data === 'object' && data.redirect) {
          return {
            success: false,
            error: `Session not valid, API returned redirect: ${data.redirect}`,
          };
        }
        return { success: true, data };
      } catch (e) {
        const err = e as Error;
        return {
          success: false,
          error: `Failed to parse response: ${err.message}`,
        };
      }
    } catch (e) {
      const err = e as Error;
      return {
        success: false,
        error: `Request failed: ${err.message}`,
      };
    }
  }

  async getInitialData(): Promise<ApiResponse<InitialData>> {
    return this.request('dataPremièreConnexion');
  }

  async getSemestres(): Promise<ApiResponse<Semestre[]>> {
    const result = await this.getInitialData();
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.semestres };
  }

  async getReleveEtudiant(semestreId: string | number): Promise<ApiResponse<Releve>> {
    return this.request('relevéEtudiant', { semestre: semestreId.toString() });
  }

  async getAllReleves(): Promise<ApiResponse<Releve[]>> {
    const semestresResult = await this.getSemestres();
    if (!semestresResult.success || !semestresResult.data) {
      return { success: false, error: semestresResult.error || 'Failed to get semestres' };
    }

    const semestres = semestresResult.data;
    const releves: Releve[] = [];

    for (const semestre of semestres) {
      let id = semestre.formsemestre_id;
      if (!id) {
        if (semestre.semestre_id) {
          id = semestre.semestre_id;
        } else if (semestre.id && !isNaN(Number(semestre.id))) {
          id = semestre.id as number;
        } else if (typeof semestre.id === 'string' && semestre.id.startsWith('Semestre')) {
          const match = semestre.id.match(/Semestre\s+(\d+)/);
          if (match) {
            id = parseInt(match[1], 10);
          } else {
            id = semestre.id as unknown as number;
          }
        } else {
          id = semestre.id as unknown as number;
        }
      }
      
      if (id) {
        const releveResult = await this.getReleveEtudiant(id);
        if (releveResult.success && releveResult.data) {
          releves.push(releveResult.data);
        }
      }
    }

    return { success: true, data: releves };
  }
}
