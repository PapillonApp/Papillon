import { authenticateWithCredentials, Client } from "turboself-api";

import { Auth } from "@/stores/account/types";

export async function refreshTurboSelfAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Client}> {
  const session = await authenticateWithCredentials(
    String(credentials.additionals?.["username"] ?? ""),
    String(credentials.additionals?.["password"] ?? ""),
    undefined,
    undefined,
    Number(credentials.additionals?.["hoteId"] ?? "")
  )

  return {
    auth: credentials,
    session
  }
}