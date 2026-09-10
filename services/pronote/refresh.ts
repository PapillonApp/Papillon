import {
  AccountKind,
  BusyPageError,
  createSessionHandle,
  loginToken,
  PageUnavailableError,
  SecurityError,
  SessionHandle,
  SuspendedIPError,
  TokenAuthenticationParams,
  UnreachableError,
} from "@blockshub/pawnote-lts";

import { SecurityChallengeError } from "@/services/errors/SecurityChallengeError";
import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { customFetcher } from "@/utils/pronote/fetcher";
import { warn } from "@/utils/logger/logger";

const MAX_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 2000;
const SUSPENSION_COOLDOWN_MS = 30 * 60 * 1000;

let suspendedUntil = 0;

export const getPronoteSuspensionRemaining = (): number =>
  Math.max(0, suspendedUntil - Date.now());

const isSafeToRetry = (e: unknown): boolean =>
  e instanceof UnreachableError ||
  e instanceof BusyPageError ||
  e instanceof PageUnavailableError;

const readStoredAuth = (serviceId: string, fallback: Auth): Auth => {
  for (const account of useAccountStore.getState().accounts) {
    const service = account.services.find(s => s.id === serviceId);
    if (service) {
      return service.auth;
    }
  }

  return fallback;
};

export async function refreshPronoteAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: SessionHandle}> {
  const suspensionRemaining = getPronoteSuspensionRemaining();
  if (suspensionRemaining > 0) {
    warn(
      `Pronote authentication is on cooldown for ${Math.ceil(suspensionRemaining / 1000)}s, not sending a new login.`
    );
    throw new SuspendedIPError();
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const handle = createSessionHandle(customFetcher);
    const stored = attempt === 0 ? credentials : readStoredAuth(accountId, credentials);
    const deviceUUID = String(stored.additionals?.["deviceUUID"] || "");

    const loginParams = {
      ...stored.additionals,
      kind: (stored.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
      deviceUUID,
    };

    try {
      const refresh = await loginToken(handle, loginParams as TokenAuthenticationParams);

      const auth: Auth = {
        accessToken: refresh.token,
        refreshToken: refresh.token,
        additionals: {
          ...refresh,
          deviceUUID,
        },
      };

      useAccountStore.getState().updateServiceAuthData(accountId, auth);

      return { auth, session: handle };
    } catch (e) {
      if (e instanceof SecurityError) {
        throw new SecurityChallengeError(e, handle, deviceUUID);
      }

      if (e instanceof SuspendedIPError) {
        suspendedUntil = Date.now() + SUSPENSION_COOLDOWN_MS;
        warn("Pronote suspended this IP, pausing every authentication for 30 minutes.");
        throw e;
      }

      lastError = e;
      if (!isSafeToRetry(e)) {
        throw e;
      }
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise(r => setTimeout(r, RETRY_BASE_DELAY_MS * 4 ** attempt));
      }
    }
  }

  throw lastError;
}
