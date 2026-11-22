import { Authenticator, Client } from "@blockshub/blocksrd";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

const MAX_RETRIES = 3;

export function refreshArdAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: Client }> {
  // The retries stay inside one tracked login: calling refreshArdAccount
  // again from here would join its own pending promise.
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    for (let retryCount = 0; ; retryCount++) {
      try {
        const stored = tracker.readCredentials();
        const username = String(stored.additionals?.["username"] ?? "");
        const password = String(stored.additionals?.["password"] ?? "");
        const schoolId = String(stored.additionals?.["schoolId"] ??"");

        tracker.credentialSent(stored);
        const authenticator = new Authenticator();
        const client = await authenticator.fromCredentials(schoolId, username, password);

        return { auth: stored, session: client };
      } catch (error) {
        if (retryCount >= MAX_RETRIES) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });
}
