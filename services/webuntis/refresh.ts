import { WebUntis } from "webuntis";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

/**
 * Refreshes the WebUntis account credentials using the provided authentication data.
 * @param credentials
 * @returns {Promise<Auth>} A promise that resolves to the updated authentication data.
 */
export async function refreshWebUntisAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth, session: WebUntis }> {

  const school = String(credentials.additionals?.["school"] || "");
  const username = String(credentials.additionals?.["username"] || "");
  const password = String(credentials.additionals?.["password"] || credentials.refreshToken || "");
  const baseURL = String(credentials.additionals?.["baseURL"] || "");

  const client = new WebUntis(
    school,
    username,
    password,
    baseURL
  );

  await client.login();

  const auth: Auth = {
    accessToken: client.sessionInformation?.sessionId || "",
    refreshToken: password,
    additionals: {
      school: school,
      username: username,
      baseURL: baseURL,
      password: password,
    },
  }

  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return { auth: auth, session: client };
}