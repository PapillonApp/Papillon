import { Client } from "@blockshub/blocksdirecte";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

export async function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, account: Client }> {
  const client = new Client();
  const refreshed = await client.auth.refreshToken(
    credentials.additionals!["username"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "E" as any,
    credentials.additionals!["token"]  as string,
    undefined,
    undefined,
    credentials.additionals!["deviceUUID"]  as string
  )

  const auth: Auth = {
    additionals: {
      "username": credentials.additionals!["username"],
      "token": refreshed.token,
      "deviceUUID": credentials.additionals!["deviceUUID"]
    }
  }

  client.auth.setAccount(0);
  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return {
    auth,
    account: client
  }
}