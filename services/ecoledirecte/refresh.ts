import { Client } from "@blockshub/blocksdirecte";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

export async function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, account: Client }> {
  const username = credentials.additionals?.["username"];
  const token = credentials.additionals?.["token"];
  const deviceUUID = credentials.additionals?.["deviceUUID"];
  if (typeof username !== "string" || !username || typeof token !== "string" || !token
    || typeof deviceUUID !== "string" || !deviceUUID) {
    throw new Error("Les identifiants EcoleDirecte sont incomplets. Reconnecte ce service.");
  }

  const client = new Client();
  await client.auth.refreshToken(
    username,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "E" as any,
    token,
    undefined,
    undefined,
    deviceUUID
  )

  client.auth.setAccount(0);
  const account = client.auth.getAccount()
  if (!account?.accessToken) {
    throw new Error("EcoleDirecte n’a pas renvoyé de jeton de session valide.");
  }

  const auth: Auth = {
    additionals: {
      "username": username,
      "token": account.accessToken,
      "deviceUUID": deviceUUID
    }
  }
  
  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return {
    auth,
    account: client
  }
}
