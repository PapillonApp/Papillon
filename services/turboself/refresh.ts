import { authenticateWithCredentials, Client } from "turboself-api";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

export function refreshTurboSelfAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Client}> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    const stored = tracker.readCredentials();
    tracker.credentialSent(stored);
    const session = await authenticateWithCredentials(
      String(stored.additionals?.["username"] ?? ""),
      String(stored.additionals?.["password"] ?? ""),
      undefined,
      undefined,
      Number(stored.additionals?.["hoteId"] ?? "")
    )

    return {
      auth: stored,
      session
    }
  });
}
