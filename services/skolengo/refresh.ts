import { LoginWithToken, Skolengo } from "skolengojs";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

export async function refreshSkolengoAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: Skolengo}> {
  if (!credentials.refreshToken) {
    error("Unable to find refreshToken")
  }
  const refreshUrl: string = String(credentials.additionals?.["refreshUrl"] || "");
  const wellKnown: string = String(credentials.additionals?.["wellKnown"] || "");
  const tokenEndpoint: string = String(credentials.additionals?.["tokenEndpoint"] || "");
  const emsCode: string = String(credentials.additionals?.["emsCode"] || "");
  const session = await LoginWithToken(refreshUrl, credentials.refreshToken, wellKnown, tokenEndpoint, emsCode);

  const authData: Auth = {
    accessToken: session.refreshToken,
    refreshToken: session.refreshToken,
    additionals: {
      refreshUrl: session.refreshURL,
      wellKnown: wellKnown,
      tokenEndpoint: tokenEndpoint,
      emsCode: emsCode
    }
  }

  useAccountStore.getState().updateServiceAuthData(accountId, authData)
  
  return { auth: authData, session }
}