import { Auth } from "@/stores/account/types";
import {
  User,
  refreshOAuthToken,
  loginWithCredentials,
  OAuthLogin,
} from "appscho";
// TODO : Refacto refresh with authtoken
export async function refreshAppSchoAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: User}> {
  const instanceId = String(credentials.additionals?.["instanceId"]);
  
  const oauthCode = credentials.additionals?.["code"];
  const refreshToken = credentials.additionals?.["refreshToken"];
  const username = credentials.additionals?.["username"];
  const password = credentials.additionals?.["password"];

  let session: OAuthLogin | User;
  let authData: Auth;

  if (refreshToken) {
    try {
      const refreshed = await refreshOAuthToken(instanceId, String(refreshToken));
      session = refreshed;

    } catch (error) {
      throw new Error(`Failed to refresh OAuth token: ${error}`);
    }
  } else if (username && password) {
    try {
      session = await loginWithCredentials(instanceId, String(username), String(password));
      
      authData = {
        additionals: {
          instanceId,
          username: String(username),
          password: String(password),
        }
      };
    } catch (error) {
      throw new Error(`Failed to refresh with credentials: ${error}`);
    }
  } else {
    throw new Error("No refresh method available - missing both refresh token and credentials");
  }

  return {
    auth: authData,
    session
  };
}