import { loginWithCredentials, refreshOAuthTokenWithUser, User } from "@blockshub/blockscho";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

export function refreshAppSchoAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: User }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    const stored = tracker.readCredentials();
    const additionals = stored.additionals || {};
    const instanceId = additionals["instanceId"];
    const refreshToken = additionals["refreshToken"];
    const username = additionals["username"];
    const password = additionals["password"];

    if (!instanceId) {
      throw new Error("instanceId is required");
    }

    let session: User;
    const authData: Auth = { additionals: { instanceId } };

    try {
      if (refreshToken) {
        tracker.credentialSent(stored);
        session = await refreshOAuthTokenWithUser(String(instanceId), String(refreshToken));
        authData.additionals!.refreshToken = refreshToken;
      } else if (username && password) {
        tracker.credentialSent(stored);
        session = await loginWithCredentials(String(instanceId), String(username), String(password));
        authData.additionals!.username = username;
        authData.additionals!.password = password;
      } else {
        throw new Error("No refresh method available - missing both refresh token and credentials");
      }
    } catch (error) {
      throw new Error(
        `Failed to refresh AppScho session: ${error}`
      );
    }

    tracker.credentialReceived(authData);

    return { auth: authData, session };
  });
}
