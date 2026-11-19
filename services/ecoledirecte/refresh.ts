import { Client, InvalidCredentials, Require2FA } from "@blockshub/blocksdirecte";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { AuthErrorClassifier } from "@/services/auth/types";
import { Auth } from "@/stores/account/types";

const classifyEDError: AuthErrorClassifier = e => {
  if (e instanceof Require2FA) {
    return "security_challenge";
  }
  if (e instanceof InvalidCredentials) {
    return "credential_rejected";
  }
  return undefined;
};

export function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, account: Client }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: true, classifyError: classifyEDError }, async tracker => {
    // The caller's copy can be outdated if another login already rotated the token
    const stored = tracker.readCredentials();
    const client = new Client();

    // A single request both consumes the token and returns the next one.
    tracker.credentialSent(stored);
    tracker.awaitingNewCredential();
    await client.auth.refreshToken(
      stored.additionals!["username"] as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "E" as any,
      stored.additionals!["token"] as string,
      undefined,
      undefined,
      stored.additionals!["deviceUUID"] as string
    )

    client.auth.setAccount(0);
    const account = client.auth.getAccount()

    const auth: Auth = {
      additionals: {
        "username": stored.additionals!["username"],
        "token": account.accessToken,
        "deviceUUID": stored.additionals!["deviceUUID"]
      }
    }

    tracker.credentialReceived(auth);

    return {
      auth,
      account: client
    }
  });
}
