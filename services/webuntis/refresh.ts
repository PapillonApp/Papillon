import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { Credentials, WebUntisClient } from "webuntis-client";

export async function refreshWebUntisAccount(accountId: string, credentials: Auth): Promise<{
  auth: Auth,
  client: WebUntisClient
}> {
  if ( credentials.additionals === undefined ) {
    throw new Error("There is no additional credentials");
  }

  const school = credentials.additionals.school as string ?? "";
  const username = credentials.additionals.username as string ?? "";
  const password = credentials.additionals.password as string ?? "";
  const deviceUUID = credentials.additionals.deviceUUID as string ?? "";

  const webUntisCredentials = new Credentials(school, username, password);
  const client = new WebUntisClient(webUntisCredentials);

  await client.auth.login(username, password);

  const auth: Auth = {
    additionals: {
      username: username,
      password: password,
      deviceUUID: deviceUUID,
    },
  }

  useAccountStore.getState().updateServiceAuthData(accountId, auth)

  return {
    auth: auth,
    client: client
  };
}