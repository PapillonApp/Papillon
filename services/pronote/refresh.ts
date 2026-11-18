import {
  AccountKind,
  BusyPageError,
  createSessionHandle,
  loginToken,
  PageUnavailableError,
  RefreshInformation,
  SecurityError,
  SessionHandle,
  TokenAuthenticationParams,
  UnreachableError,
} from "@blockshub/pawnote-lts";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { CredentialsMissingError } from "@/services/auth/errors";
import { AuthTracker } from "@/services/auth/types";
import { SecurityChallengeError } from "@/services/errors/SecurityChallengeError";
import { classifyPronoteError } from "@/services/pronote/errors";
import { isValidPicture, useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { customFetcher } from "@/utils/pronote/fetcher";
import { extractPronoteProfilePicture } from "@/utils/pronote/profilePicture";

const MAX_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 2000;

type PronoteRefresh = { auth: Auth, session: SessionHandle };

const isSafeToRetry = (e: unknown): boolean =>
  e instanceof UnreachableError ||
  e instanceof BusyPageError ||
  e instanceof PageUnavailableError;

const buildTokenParams = (stored: Auth, deviceUUID: string): TokenAuthenticationParams => {
  const url = String(
    stored.additionals?.["url"] || stored.additionals?.["instanceURL"] || ""
  );
  const token = String(stored.additionals?.["token"] || stored.accessToken || "");
  const username = String(stored.additionals?.["username"] || "");

  if (!url || !token || !username) {
    throw new CredentialsMissingError(
      "Stored PRONOTE credentials are incomplete, the account has to be linked again."
    );
  }

  return {
    ...stored.additionals,
    url,
    token,
    username,
    kind: (stored.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
    deviceUUID,
  } as TokenAuthenticationParams;
};

const toAuth = (refresh: RefreshInformation, deviceUUID: string): Auth => ({
  accessToken: refresh.token,
  refreshToken: refresh.token,
  additionals: {
    ...refresh,
    instanceURL: refresh.url,
    deviceUUID,
  },
});

// PRONOTE tokens are single-use: the coordinator makes every caller share one login.
export function refreshPronoteAccount(
  accountId: string,
  credentials: Auth
): Promise<PronoteRefresh> {
  return runAuthRefresh(
    accountId,
    credentials,
    { rotatesCredential: true, classifyError: classifyPronoteError },
    async tracker => {
      let lastError: unknown;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          return await loginWithStoredToken(accountId, tracker);
        } catch (e) {
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
  );
}

function backfillProfilePicture(
  serviceAccountId: string,
  session: SessionHandle,
  instanceUrl?: string
): void {
  const { accounts, lastUsedAccount, setAccountProfilePicture } = useAccountStore.getState();
  const activeAccount =
    accounts.find(acc => acc.id === lastUsedAccount && acc.services.some(s => s.id === serviceAccountId)) ??
    accounts.find(acc => acc.services.some(s => s.id === serviceAccountId));

  if (!activeAccount || isValidPicture(activeAccount.customisation?.profilePicture)) {
    return;
  }

  void extractPronoteProfilePicture(session, instanceUrl)
    .then(picture => {
      if (picture && isValidPicture(picture)) {
        setAccountProfilePicture(activeAccount.id, picture);
      }
    })
    .catch(() => undefined);
}

async function loginWithStoredToken(
  serviceAccountId: string,
  tracker: AuthTracker
): Promise<PronoteRefresh> {
  const handle = createSessionHandle(customFetcher);
  const stored = tracker.readCredentials();
  const deviceUUID = String(stored.additionals?.["deviceUUID"] || "");
  const loginParams = buildTokenParams(stored, deviceUUID);

  try {
    const refresh = await loginToken(handle, loginParams, {
      onCredentialSent: () => tracker.credentialSent(stored),
      onAuthenticationSent: () => tracker.awaitingNewCredential(),
      // Saved before ParametresUtilisateur: if that request fails, the next
      // login still has a valid token.
      onTokenIssued: information => {
        if (information.token) {
          tracker.credentialReceived(toAuth(information, deviceUUID));
        }
      },
    });

    const auth = toAuth(refresh, deviceUUID);
    tracker.credentialReceived(auth);
    backfillProfilePicture(serviceAccountId, handle, refresh.url || loginParams.url);
    return { auth, session: handle };
  } catch (e) {
    if (e instanceof SecurityError) {
      throw new SecurityChallengeError(e, handle, deviceUUID);
    }
    throw e;
  }
}
