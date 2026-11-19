import { LinksignClient, refreshTokenByRefreshToken } from "@studentsphere/linksign";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { CredentialsMissingError } from "@/services/auth/errors";
import { AuthErrorClassifier } from "@/services/auth/types";
import { Auth } from "@/stores/account/types";
import { getStaticDeviceId } from "@/utils/device";

export const isEdusignAuthError = (err: unknown): boolean => {
  const name = (err as Error)?.name;
  return name === "InvalidTokenError" || name === "UnauthorizedError";
};

const classifyEdusignError: AuthErrorClassifier = err =>
  isEdusignAuthError(err) ? "credential_rejected" : undefined;

const createClient = (auth: Auth, deviceId: string): LinksignClient =>
  new LinksignClient(auth.accessToken!, {
    deviceId,
    refreshToken: auth.refreshToken,
    schoolId: String(auth.additionals?.["schoolId"] ?? ""),
  });

export function refreshEdusignAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session?: LinksignClient }> {
  return runAuthRefresh(
    accountId,
    credentials,
    { rotatesCredential: true, classifyError: classifyEdusignError },
    async tracker => {
      const stored = tracker.readCredentials();
      if (!stored.refreshToken && !stored.accessToken) {
        throw new CredentialsMissingError("No tokens available for Edusign account refresh, the account has to be linked again.");
      }

      const staticDeviceId = await getStaticDeviceId();

      if (!stored.refreshToken) {
        return { auth: stored, session: createClient(stored, staticDeviceId) };
      }

      // The refresh token rotates on each use: the new one is saved as soon as it arrives.
      tracker.credentialSent(stored);
      tracker.awaitingNewCredential();
      const refreshed = await refreshTokenByRefreshToken(stored.refreshToken, staticDeviceId);
      const authData: Auth = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token || stored.refreshToken,
        additionals: stored.additionals,
      };
      tracker.credentialReceived(authData);

      return { auth: authData, session: createClient(authData, staticDeviceId) };
    }
  );
}
