import { Auth } from "@/stores/account/types";
import { authWithRefreshToken, Multi } from "esup-multi.js";

export async function refreshMultiSelfAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: Multi }> {
  const session = await authWithRefreshToken(
    String(credentials.additionals?.["instanceURL"]),
    { refreshAuthToken: String(credentials.refreshToken) }
  );

  return {
    auth: credentials,
    session,
  };
}
