import { Authenticator, Client } from "pawrd";

import { Auth } from "@/stores/account/types";

export async function refreshArdAccount(
  accountId: string,
  credentials: Auth,
  retryCount: number = 0
): Promise<{ auth: Auth; session: Client }> {
  try {
    const username = String(credentials.additionals?.["username"] ?? "");
    const password = String(credentials.additionals?.["password"] ?? "");
    const schoolId = String(credentials.additionals?.["schoolId"] ??"");

    const authenticator = new Authenticator();
    const client = await authenticator.fromCredentials(schoolId, username, password);
    
    return { auth: credentials, session: client };
  } catch (error) {
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return refreshArdAccount(accountId, credentials, retryCount + 1);
    }
    throw error;
  }
}
