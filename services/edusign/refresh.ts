import { LinksignClient, refreshTokenByRefreshToken } from "@studentsphere/linksign";
import { Auth, Services } from "@/stores/account/types";
import { error, log } from "@/utils/logger/logger";
import { AuthenticationError } from "../errors/AuthenticationError";
import { getStaticDeviceId } from "@/utils/device";
import { useAccountStore } from "@/stores/account";

export const isEdusignAuthError = (err: unknown): boolean => {
  const name = (err as Error)?.name;
  return name === "InvalidTokenError" || name === "UnauthorizedError";
};

export async function refreshEdusignAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session?: LinksignClient }> {
  if (!credentials.refreshToken && !credentials.accessToken) {
    throw new AuthenticationError("No tokens available for Edusign account refresh", {
      id: accountId,
      serviceId: Services.EDUSIGN,
      auth: credentials,
    } as any);
  }
  if (credentials.refreshToken) {
    try {
      const staticDeviceId = await getStaticDeviceId();
      const refreshed = await refreshTokenByRefreshToken(credentials.refreshToken, staticDeviceId);
      const authData: Auth = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token || credentials.refreshToken,
        additionals: credentials.additionals,
      };

      useAccountStore.getState().updateServiceAuthData(accountId, authData);

      const client = new LinksignClient(authData.accessToken!, {
        deviceId: staticDeviceId,
        refreshToken: authData.refreshToken,
        schoolId: String(credentials.additionals?.["schoolId"] ?? ""),
      });

      return { auth: authData, session: client };
    } catch (err) {
      error("Failed to refresh Edusign token via refreshToken: " + String(err), "Edusign.refreshEdusignAccount");
      if (isEdusignAuthError(err)) {
        throw new AuthenticationError("Edusign refresh token expired", {
          id: accountId,
          serviceId: Services.EDUSIGN,
          auth: credentials,
        } as any);
      }
      throw err;
    }
  }

  const staticDeviceId = await getStaticDeviceId();
  const client = new LinksignClient(credentials.accessToken!, {
    deviceId: staticDeviceId,
    refreshToken: credentials.refreshToken,
    schoolId: String(credentials.additionals?.["schoolId"] ?? ""),
  });

  return { auth: credentials, session: client };
}
