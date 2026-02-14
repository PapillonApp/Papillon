import { Credentials, WebUntisClient } from "webuntis-client";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

/**
 * Refreshes the WebUntis account credentials using the provided authentication data.
 * @param accountId
 * @param authCredentials
 * @returns {Promise<Auth>} A promise that resolves to the updated authentication data.
 */
export async function refreshWebUntisAccount(
  accountId: string,
  authCredentials: Auth
): Promise<{ auth: Auth; session: WebUntisClient }> {
  const school = String(authCredentials.additionals?.["school"] || "");
  const username = String(authCredentials.additionals?.["username"] || "");
  const password = String(
    authCredentials.additionals?.["password"] ||
      authCredentials.refreshToken ||
      ""
  );
  const url = String(authCredentials.additionals?.["url"] || "");

  const credentials = new Credentials(
    "PapillonApp",
    school,
    username,
    password
  );
  const client = new WebUntisClient(credentials);

  const session = await client.login();

  const auth: Auth = {
    accessToken: session.sessionId || "",
    refreshToken: password,
    additionals: {
      school: school,
      username: username,
      url: url,
      password: password,
    },
  };

  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return { auth: auth, session: client };
}
