import { authenticateWithCredentials, Client } from "turboself-api";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

export function refreshTurboSelfAccount(accountId: string, credentials: Auth): Promise<{ auth: Auth; session: Client }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    const stored = tracker.readCredentials();
    tracker.credentialSent(stored);
    const parsed = Number(stored.additionals?.["hoteId"]);
    const hoteId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

    const session = await authenticateWithCredentials(
      String(stored.additionals?.["username"] ?? ""),
      String(stored.additionals?.["password"] ?? ""),
      undefined,
      undefined,
      hoteId
    );

    const cardNumber = session.host?.cardNumber ?? stored.additionals?.["cardNumber"];
    const updatedAuth: Auth = {
      ...stored,
      additionals: {
        ...stored.additionals,
        ...(cardNumber !== undefined && cardNumber !== "" ? { cardNumber } : {}),
      },
    };

    if (cardNumber !== undefined && cardNumber !== "" && cardNumber !== stored.additionals?.["cardNumber"]) {
      tracker.credentialReceived(updatedAuth);
    }

    return {
      auth: updatedAuth,
      session,
    };
  });
}
