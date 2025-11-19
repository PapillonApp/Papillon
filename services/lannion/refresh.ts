import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

export async function refreshMultiSession(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: Multi }> {

  const instanceUrl = credentials.additionals?.["instanceUrl"] as string;
  const session = await authWithRefreshToken(instanceUrl, {
    refreshAuthToken: credentials.refreshToken,
  });

  const authData: Auth = {
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    additionals: {
      instanceUrl: instanceUrl,
    },
  };

  useAccountStore.getState().updateServiceAuthData(accountId, authData);

  return { auth: authData, session };
}
