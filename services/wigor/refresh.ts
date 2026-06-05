import { Auth } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { getProfile, loginWithCredentials, User } from "@studentsphere/linkgor";

export async function refreshWigorAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: User }> {
  const additionals = credentials.additionals || {};
  const instanceId = additionals["instanceId"];
  const token = additionals["token"] || credentials.accessToken;
  const username = additionals["username"];
  const password = additionals["password"];

  if (!instanceId) {
    throw new Error("instanceId is required");
  }

  let session: User;
  const authData: Auth = {
    accessToken: "",
    additionals: {
      instanceId,
    },
  };

  try {
    if (token) {
      try {
        const profile = await getProfile(String(instanceId), String(token));
        session = {
          firstname: profile.firstname,
          lastname: profile.lastname,
          token: String(token),
        };
        authData.accessToken = String(token);
        authData.additionals = {
          instanceId,
          token: String(token),
          username: username ? String(username) : "",
          password: password ? String(password) : "",
        };
      } catch (tokenError) {
        if (username && password) {
          session = await loginWithCredentials(
            String(instanceId),
            String(username),
            String(password)
          );
          authData.accessToken = session.token;
          authData.additionals = {
            instanceId,
            token: session.token,
            username: String(username),
            password: String(password),
          };
        } else {
          throw tokenError;
        }
      }
    } else if (username && password) {
      session = await loginWithCredentials(
        String(instanceId),
        String(username),
        String(password)
      );
      authData.accessToken = session.token;
      authData.additionals = {
        instanceId,
        token: session.token,
        username: String(username),
        password: String(password),
      };
    } else {
      throw new Error("No token or credentials found to refresh account");
    }
  } catch (error) {
    throw new Error(`Failed to refresh Wigor session: ${error}`);
  }

  useAccountStore.getState().updateServiceAuthData(accountId, authData);

  return { auth: authData, session };
}
