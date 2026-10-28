import { GetUserInfo, OIDCRefresh, Skolengo } from "skolengojs";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { CredentialsMissingError } from "@/services/auth/errors";
import { Auth } from "@/stores/account/types";

export function refreshSkolengoAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: Skolengo}> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: true }, async tracker => {
    const stored = tracker.readCredentials();
    if (!stored.refreshToken) {
      throw new CredentialsMissingError("Stored Skolengo refresh token is missing, the account has to be linked again.");
    }
    const refreshUrl: string = String(stored.additionals?.["refreshUrl"] || "");
    const wellKnown: string = String(stored.additionals?.["wellKnown"] || "");
    const tokenEndpoint: string = String(stored.additionals?.["tokenEndpoint"] || "");
    const emsCode: string = String(stored.additionals?.["emsCode"] || "");

    const toAuth = (refreshToken: string, url: string): Auth => ({
      accessToken: refreshToken,
      refreshToken,
      additionals: {
        refreshUrl: url,
        wellKnown: wellKnown,
        tokenEndpoint: tokenEndpoint,
        emsCode: emsCode
      }
    });

    // The two steps of LoginWithToken, split so the rotated refresh token is
    // saved before GetUserInfo has a chance to fail.
    tracker.credentialSent(stored);
    tracker.awaitingNewCredential();
    const tokens = await OIDCRefresh(refreshUrl, stored.refreshToken);
    const refreshToken = tokens.refresh_token || stored.refreshToken;
    tracker.credentialReceived(toAuth(refreshToken, refreshUrl));

    const session = await GetUserInfo(tokens.access_token, refreshToken, wellKnown, tokenEndpoint, emsCode);

    const authData = toAuth(session.refreshToken, session.refreshURL);
    tracker.credentialReceived(authData);

    return { auth: authData, session };
  });
}
