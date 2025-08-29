import { Auth } from "@/stores/account/types";
import { Identification, refresh } from "ezly";

export async function refreshIzlyAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Identification}> {
  const session = credentials.session as unknown as Identification
  const secret = String(credentials.additionals?.["secret"])
  
  const _ = await refresh(session, secret);

  const authData: Auth = {
    session: session,
    additionals: {
      secret
    }
  }

  return {
    auth: authData,
    session
  }
}