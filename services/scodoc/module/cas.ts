import { fetch } from 'expo-fetcher';

import { error, log, warn } from '@/utils/logger/logger';

/**
 * CAS REST v2 authentication client.
 * Supports the CAS REST protocol (POST to /v1/tickets) to programmatically
 * obtain a service ticket without a browser/WebView.
 *
 * Tested against the UPPA CAS portal (https://cas.univ-pau.fr/cas/).
 */

export interface CasTicketResult {
  /** The service ticket (ST-xxx) to use with the target service */
  serviceTicket: string;
  /** The TGT URL, usable to request more service tickets without re-authenticating */
  tgtUrl: string;
}

/**
 * Authenticate with a CAS server and obtain a service ticket for the given service URL.
 *
 * @param casBaseUrl  Base URL of the CAS server, e.g. "https://cas.univ-pau.fr/cas"
 * @param username    The user's CAS username (login ENT / identifiant universitaire)
 * @param password    The user's CAS password
 * @param serviceUrl  The URL of the service to authenticate to, e.g. "https://scodoc.iutpa.univ-pau.fr/ScoDoc/"
 */
export async function authenticateWithCas(
  casBaseUrl: string,
  username: string,
  password: string,
  serviceUrl: string
): Promise<CasTicketResult> {
  const base = casBaseUrl.replace(/\/+$/, '');

  // Step 1: Request a Ticket Granting Ticket (TGT)
  const tgtUrl = await requestTGT(base, username, password);
  log(`[CAS] TGT obtained`);

  // Step 2: Request a Service Ticket (ST) for the target service
  const serviceTicket = await requestServiceTicket(tgtUrl, serviceUrl);
  log(`[CAS] Service ticket obtained for ${serviceUrl}`);

  return { serviceTicket, tgtUrl };
}

/**
 * Request a fresh service ticket from an existing TGT.
 * Useful to re-authenticate without re-entering credentials.
 */
export async function renewServiceTicket(
  tgtUrl: string,
  serviceUrl: string
): Promise<string> {
  return requestServiceTicket(tgtUrl, serviceUrl);
}

async function requestTGT(casBase: string, username: string, password: string): Promise<string> {
  const url = `${casBase}/v1/tickets`;
  const body = new URLSearchParams({ username, password }).toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/plain, */*',
    },
    body,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Identifiants CAS incorrects');
  }

  if (response.status !== 201) {
    const text = await response.text().catch(() => '');
    throw new Error(`CAS TGT request failed: HTTP ${response.status} – ${text.slice(0, 120)}`);
  }

  // The TGT URL is in the Location header
  const location = response.headers.get('Location') || response.headers.get('location');
  if (!location) {
    // Some CAS servers return the TGT URL in the body
    const body = await response.text();
    if (body.startsWith('http')) { return body.trim(); }
    throw new Error('CAS server did not return a TGT location');
  }

  return location;
}

async function requestServiceTicket(tgtUrl: string, serviceUrl: string): Promise<string> {
  const body = new URLSearchParams({ service: serviceUrl }).toString();

  const response = await fetch(tgtUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/plain, */*',
    },
    body,
  });

  if (response.status !== 200) {
    const text = await response.text().catch(() => '');
    throw new Error(`CAS ST request failed: HTTP ${response.status} – ${text.slice(0, 120)}`);
  }

  const ticket = await response.text();
  if (!ticket.startsWith('ST-')) {
    warn(`[CAS] Unexpected service ticket format: ${ticket.slice(0, 40)}`);
  }

  return ticket.trim();
}

/**
 * Exchange a CAS service ticket for a ScoDoc session cookie.
 * ScoDoc validates the ticket against CAS and sets a Flask session cookie.
 *
 * @param scodocBaseUrl  Base URL of the ScoDoc instance
 * @param serviceTicket  The CAS service ticket (ST-xxx)
 * @returns The session cookie string to use in subsequent API requests
 */
export async function exchangeTicketForScodocSession(
  scodocBaseUrl: string,
  serviceTicket: string
): Promise<string> {
  const base = scodocBaseUrl.replace(/\/+$/, '');
  // ScoDoc processes the CAS ticket at the root URL with ?ticket= param
  const url = `${base}/ScoDoc/?ticket=${encodeURIComponent(serviceTicket)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to exchange CAS ticket with ScoDoc: ${msg}`);
  }

  // Extract session cookie from response
  const setCookieHeader = response.headers.get('set-cookie') || response.headers.get('Set-Cookie') || '';
  const sessionCookie = extractSessionCookie(setCookieHeader);

  if (!sessionCookie) {
    // If no set-cookie, the ticket may have already been validated (or redirect happened)
    // Try to find the session in the response headers chain
    error('[CAS] No session cookie received after ticket exchange', 'exchangeTicketForScodocSession');
    throw new Error('ScoDoc did not provide a session cookie after CAS login');
  }

  log('[CAS] ScoDoc session cookie obtained');
  return sessionCookie;
}

function extractSessionCookie(setCookieHeader: string): string {
  if (!setCookieHeader) { return ''; }

  // Handle multiple Set-Cookie headers joined by comma
  // Look for Flask session cookie (typically named "session")
  const cookies = setCookieHeader.split(/,(?=[^ ])/);
  for (const cookiePart of cookies) {
    const nameValue = cookiePart.split(';')[0].trim();
    if (nameValue.toLowerCase().startsWith('session=')) {
      return nameValue;
    }
  }

  // Fall back to any cookie we can find
  const firstCookie = setCookieHeader.split(';')[0].trim();
  return firstCookie || '';
}
