import { fetch } from 'expo-fetcher';

import { log, warn } from '@/utils/logger/logger';

import { ScodocSession } from './types';

/**
 * ScoDoc client using the ScoDoc REST API v1.
 * Supports any ScoDoc instance with direct username/password auth.
 *
 * The user provides the base URL of their ScoDoc instance,
 * e.g. "https://scodoc.myuniversity.fr"
 */
export class ScodocClient {
  private token: string | null = null;
  private etudid: number | null = null;
  private deptAcronym: string | null = null;

  constructor(public baseUrl: string) {
    // Normalize base URL (remove trailing slash)
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Authenticate using ScoDoc REST API tokens endpoint.
   * POST /ScoDoc/api/tokens with Basic auth.
   */
  async authenticate(username: string, password: string): Promise<void> {
    const credentials = btoa(`${username}:${password}`);
    const url = `${this.baseUrl}/ScoDoc/api/tokens`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Invalid credentials');
    }

    if (response.status !== 200) {
      const body = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${body}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('No token received from ScoDoc API');
    }

    this.token = data.token;
    log('[ScodocClient] Authentication successful');
  }

  /**
   * Store etudid and dept after discovery.
   */
  setStudentInfo(etudid: number, deptAcronym: string) {
    this.etudid = etudid;
    this.deptAcronym = deptAcronym;
  }

  getSession(): ScodocSession {
    return {
      token: this.token || '',
      baseUrl: this.baseUrl,
      etudid: this.etudid ?? undefined,
      deptAcronym: this.deptAcronym ?? undefined,
      createdAt: new Date(),
    };
  }

  setSession(session: ScodocSession) {
    this.token = session.token;
    this.baseUrl = session.baseUrl;
    this.etudid = session.etudid ?? null;
    this.deptAcronym = session.deptAcronym ?? null;
  }

  async validateSession(): Promise<{ isValid: boolean; error?: string }> {
    if (!this.token) { return { isValid: false, error: 'No token' }; }
    return { isValid: true };
  }

  /**
   * Make an authenticated GET request to the ScoDoc API.
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    let url = `${this.baseUrl}${path}`;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Session expired or unauthorized');
    }

    if (response.status !== 200) {
      const body = await response.text();
      throw new Error(`API request failed: ${response.status} ${body}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Failed to parse API response: ${text.slice(0, 100)}`);
    }
  }
}

export async function authenticateWithCredentials(
  baseUrl: string,
  username: string,
  password: string
): Promise<ScodocClient> {
  const client = new ScodocClient(baseUrl);
  await client.authenticate(username, password);
  warn('[ScodocClient] Client created for ' + baseUrl);
  return client;
}
