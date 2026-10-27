import { authWithRefreshToken, Multi } from "esup-multi.js";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { CredentialsMissingError } from "@/services/auth/errors";
import { Auth } from "@/stores/account/types";

export function refreshMultiSession(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: Multi }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    const stored = tracker.readCredentials();
    if (!stored.refreshToken) {
      throw new CredentialsMissingError("Stored Multi refresh token is missing, the account has to be linked again.");
    }

    const instanceUrl = stored.additionals?.["instanceUrl"] as string;
    tracker.credentialSent(stored);
    const session = await authWithRefreshToken(instanceUrl, {
      refreshAuthToken: stored.refreshToken,
    });

    const authData: Auth = {
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      additionals: {
        instanceUrl: instanceUrl,
      },
    };

    tracker.credentialReceived(authData);

    return { auth: authData, session };
  });
}
