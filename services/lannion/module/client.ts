import { fetch } from 'expo-fetcher';

import { log, warn } from '@/utils/logger/logger';

import { LannionSession } from './types';

const CAS_CONFIG = {
  CAS_LOGIN_URL: 'https://sso-cas.univ-rennes.fr/login',
  SERVICE_URL: 'https://notes9.iutlan.univ-rennes1.fr/services/data.php',
  DO_AUTH_URL: 'https://notes9.iutlan.univ-rennes1.fr/services/doAuth.php',
  COOKIE_NAME: 'PHPSESSID',
};

export class LannionClient {
  private phpSessionId: string | null = null;

  constructor() { /* empty */ }

  async authenticate(username: string, password: string): Promise<void> {
    
    const loginUrl = `${CAS_CONFIG.CAS_LOGIN_URL}?service=${encodeURIComponent(CAS_CONFIG.DO_AUTH_URL)}`;
    
    const loginPageResponse = await fetch(loginUrl, {
      method: 'GET',
    });

    if (loginPageResponse.status !== 200) {
      throw new Error(`Failed to load CAS login page: ${loginPageResponse.status}`);
    }

    const loginPageHtml = await loginPageResponse.text();
    const execution = this.extractExecutionToken(loginPageHtml);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('execution', execution);
    formData.append('_eventId', 'submit');
    formData.append('geolocation', '');

    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'manual',
    });


    // eslint-disable-next-line no-useless-assignment
    let redirectUrl: string | null = null;

    if (loginResponse.status >= 300 && loginResponse.status < 400) {
      redirectUrl = loginResponse.headers.get('location');
      log(`[LannionClient] Redirect URL found: ${redirectUrl}`);
    } else {
      const body = await loginResponse.text();
      if (body.includes('name="username"') || body.includes('type="password"')) {
        throw new Error('Invalid credentials');
      }
      throw new Error(`Unexpected response status: ${loginResponse.status}`);
    }

    if (!redirectUrl) {
      throw new Error('No redirect URL found after login');
    }

    const authResponse = await fetch(redirectUrl, {
      method: 'GET',
      redirect: 'manual',
    });


    const setCookie = authResponse.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/PHPSESSID=([^;]+)/);
      if (match) {
        this.phpSessionId = match[1];
      } else {
        log('[LannionClient] PHPSESSID not found in Set-Cookie header');
      }
    } else {
      log('[LannionClient] No Set-Cookie header in auth response');
    }
    
    if (!this.phpSessionId) {
      warn('[LannionClient] Warning: Session ID is null after authentication flow');
      throw new Error('Failed to extract session ID');
    }
    log('[LannionClient] Authentication successful');
  }

  private extractExecutionToken(html: string): string {
    const match = html.match(/name="execution"\s+value="([^"]+)"/);
    if (!match) {
      throw new Error('Could not extract execution token from login page');
    }
    return match[1];
  }

  getSession(): LannionSession {
    return {
      phpSessionId: this.phpSessionId || 'unknown',
      createdAt: new Date(),
    };
  }

  setSession(phpSessionId: string) {
    this.phpSessionId = phpSessionId;
  }

  async validateSession(): Promise<{ isValid: boolean; error?: string }> {
    if (!this.phpSessionId) {return { isValid: false, error: 'No session ID' };}
    return { isValid: true };
  }

  async clearSessionAndCookies() {
    this.phpSessionId = null;
  }
}

export async function authenticateWithCredentials(username: string, password: string) {
  const client = new LannionClient();
  await client.authenticate(username, password);
  return client;
}
