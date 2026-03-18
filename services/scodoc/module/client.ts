import { fetch } from 'expo-fetcher';

import { log, warn } from '@/utils/logger/logger';

import { authenticateWithCas, exchangeTicketForScodocSession } from './cas';
import { ScodocSession } from './types';

/** URL of the UPPA CAS portal */
export const UPPA_CAS_URL = 'https://cas.univ-pau.fr/cas';

/**
 * ScoDoc client using the ScoDoc REST API v1.
 * Supports two authentication modes:
 *  - Direct (Basic auth): POST /ScoDoc/api/tokens with username:password
 *  - CAS session: CAS REST → service ticket → Flask session cookie
 *
 * The user provides the base URL of their ScoDoc instance,
 * e.g. "https://scodoc.iutpa.univ-pau.fr"
 */
export class ScodocClient {
  private token: string | null = null;
  /** Flask session cookie for CAS-authenticated instances */
  private sessionCookie: string | null = null;
  /** CAS TGT URL for re-authentication without re-entering credentials */
  private casTgtUrl: string | null = null;
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
    log('[ScodocClient] Authentication successful (Basic)');
  }

  /**
   * Authenticate via CAS REST protocol.
   * Obtains a CAS service ticket and exchanges it for a ScoDoc session cookie.
   *
   * @param casBaseUrl  CAS server base URL (e.g. https://cas.univ-pau.fr/cas)
   * @param username    CAS username
   * @param password    CAS password
   */
  async authenticateWithCAS(casBaseUrl: string, username: string, password: string): Promise<void> {
    const serviceUrl = `${this.baseUrl}/ScoDoc/`;

    const { serviceTicket, tgtUrl } = await authenticateWithCas(
      casBaseUrl,
      username,
      password,
      serviceUrl
    );

    this.casTgtUrl = tgtUrl;

    const cookie = await exchangeTicketForScodocSession(this.baseUrl, serviceTicket);
    this.sessionCookie = cookie;

    log('[ScodocClient] Authentication successful (CAS)');
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
      sessionCookie: this.sessionCookie ?? undefined,
      casTgtUrl: this.casTgtUrl ?? undefined,
      createdAt: new Date(),
    };
  }

  setSession(session: ScodocSession) {
    this.token = session.token || null;
    this.baseUrl = session.baseUrl;
    this.etudid = session.etudid ?? null;
    this.deptAcronym = session.deptAcronym ?? null;
    this.sessionCookie = session.sessionCookie ?? null;
    this.casTgtUrl = session.casTgtUrl ?? null;
  }

  async validateSession(): Promise<{ isValid: boolean; error?: string }> {
    if (!this.token && !this.sessionCookie) {
      return { isValid: false, error: 'No token or session cookie' };
    }
    return { isValid: true };
  }

  /**
   * Build request headers depending on auth mode.
   * Prefers Bearer token; falls back to session cookie for CAS sessions.
   */
  private buildAuthHeaders(): Record<string, string> {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
    }
    if (this.sessionCookie) {
      return {
        'Cookie': this.sessionCookie,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
    }
    throw new Error('Not authenticated');
  }

  /**
   * Make an authenticated GET request to the ScoDoc API.
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    if (!this.token && !this.sessionCookie) {
      throw new Error('Not authenticated');
    }

    let url = `${this.baseUrl}${path}`;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildAuthHeaders(),
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

/**
 * Authenticate to ScoDoc via CAS (e.g. UPPA portal).
 *
 * @param baseUrl     ScoDoc instance base URL
 * @param casBaseUrl  CAS server base URL (defaults to UPPA CAS)
 * @param username    CAS username
 * @param password    CAS password
 */
export async function authenticateWithCAS(
  baseUrl: string,
  casBaseUrl: string,
  username: string,
  password: string
): Promise<ScodocClient> {
  const client = new ScodocClient(baseUrl);
  await client.authenticateWithCAS(casBaseUrl, username, password);
  warn('[ScodocClient] CAS client created for ' + baseUrl);
  return client;
}
