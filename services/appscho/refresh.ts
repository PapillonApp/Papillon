import { Auth } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { loginWithCredentials, refreshOAuthTokenWithUser, User } from "appscho";

export async function refreshAppSchoAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: User }> {
  const additionals = credentials.additionals || {};
  const instanceId = additionals["instanceId"];
  const currentRefreshToken = additionals["refreshToken"];
  const username = additionals["username"];
  const password = additionals["password"];

  if (!instanceId) {
    throw new Error("instanceId is required");
  }

  let session: User;

  try {
    if (currentRefreshToken) {
      session = await refreshOAuthTokenWithUser(String(instanceId), String(currentRefreshToken));
    } else if (username && password) {
      session = await loginWithCredentials(String(instanceId), String(username), String(password));
    } else {
      throw new Error("No refresh method available");
    }

    const newAuthData: Auth = {
      additionals: {
        ...additionals,
        refreshToken: session.refreshToken || currentRefreshToken,
      },
    };

    useAccountStore.getState().updateServiceAuthData(accountId, newAuthData);

    return { auth: newAuthData, session };
  } catch (error) {
    throw new Error(`Failed to refresh AppScho session: ${error}`);
  }
}