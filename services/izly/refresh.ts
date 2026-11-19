import { Identification, refresh } from "ezly";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

export function refreshIzlyAccount(accountId: string, credentials: Auth): Promise<{ auth: Auth; session: Identification }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    const stored = tracker.readCredentials();
    const session = stored.session as Identification;
    const secret = String(stored.additionals?.["secret"]);

    tracker.credentialSent(stored);
    await refresh(session, secret);

    const authData: Auth = {
      session,
      additionals: {
        secret,
      },
    };

    tracker.credentialReceived(authData);

    return {
      auth: authData,
      session
    };
  });
}
