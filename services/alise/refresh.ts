import { authenticateWithCredentials, Client } from "alise-api";
import { Auth } from "@/stores/account/types";

export async function refreshAliseAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Client}> {
  const session = await authenticateWithCredentials(
    String(credentials.additionals?.["username"] ?? ""),
    String(credentials.additionals?.["password"] ?? ""),
    String(credentials.additionals?.["site"] ?? "")
  );
  return { auth: credentials, session };
}
