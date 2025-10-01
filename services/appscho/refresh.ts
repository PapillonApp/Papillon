import { Auth } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { loginWithCredentials, refreshOAuthTokenWithUser, User } from "appscho";

export async function refreshAppSchoAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: User }> {
  const additionals = credentials.additionals || {};
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
      session = await refreshOAuthTokenWithUser(String(instanceId), String(refreshToken));
      authData.additionals!.refreshToken = refreshToken;
    } else if (username && password) {
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

  useAccountStore.getState().updateServiceAuthData(accountId, authData);

  return { auth: authData, session };
}