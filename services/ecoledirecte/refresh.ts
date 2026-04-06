import { Client } from "@blockshub/blocksdirecte";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

export async function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, account: Client }> {
  const storedToken2FA = getStoredToken2FA(credentials);
  const client = new Client({
    accounts: [],
    selectedAccounts: -1,
    token2fa: storedToken2FA,
  });

  await client.auth.refreshToken(
    credentials.additionals!["username"] as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "E" as any,
    credentials.additionals!["token"]  as string,
    credentials.additionals?.["cn"] as string | undefined,
    credentials.additionals?.["cv"] as string | undefined,
    credentials.additionals!["deviceUUID"]  as string
  )

  client.auth.setAccount(0);
  const account = client.auth.getAccount()
  const token2fa = getEDToken2FA(client) ?? storedToken2FA;

  const auth: Auth = {
    additionals: {
      "username": credentials.additionals!["username"],
      "token": account.accessToken,
      "cn": credentials.additionals?.["cn"] ?? "",
      "cv": credentials.additionals?.["cv"] ?? "",
      "deviceUUID": credentials.additionals!["deviceUUID"],
      ...(token2fa ? { "token2fa": token2fa } : {})
    }
  }
  
  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return {
    auth,
    account: client
  }
}

function getStoredToken2FA(credentials: Auth): string | undefined {
  const token2fa = credentials.additionals?.["token2fa"];
  return typeof token2fa === "string" && token2fa.trim().length > 0
    ? token2fa
    : undefined;
}

function getEDToken2FA(client: Client): string | undefined {
  try {
    return client.getToken2FA();
  } catch {
    return undefined;
  }
}
