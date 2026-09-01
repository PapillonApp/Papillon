import {
  AccountKind,
  BusyPageError,
  createSessionHandle,
  loginToken,
  PageUnavailableError,
  RateLimitedError,
  ServerSideError,
  SessionHandle,
  UnreachableError,
} from "@blockshub/pawnote-lts";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { customFetcher } from "@/utils/pronote/fetcher";

const isRetryable = (e: unknown): boolean =>
  e instanceof UnreachableError ||
  e instanceof BusyPageError ||
  e instanceof RateLimitedError ||
  e instanceof ServerSideError ||
  e instanceof PageUnavailableError ||
  e instanceof TypeError;

export async function refreshPronoteAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: SessionHandle}> {
  const handle = createSessionHandle(customFetcher);

  const loginParams = {
    url: String(credentials.additionals?.["instanceURL"] || ""),
    kind: (credentials.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
    username: String(credentials.additionals?.["username"] || ""),
    token: String(credentials.refreshToken ?? ""),
    deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const refresh = await loginToken(handle, loginParams);

      const auth: Auth = {
        accessToken: refresh.token,
        refreshToken: refresh.token,
        additionals: {
          instanceURL: refresh.url,
          kind: refresh.kind,
          username: refresh.username,
          deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
        },
      };

      useAccountStore.getState().updateServiceAuthData(accountId, auth);

      return { auth, session: handle };
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) throw e;
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
    }
  }

  throw lastError;
}