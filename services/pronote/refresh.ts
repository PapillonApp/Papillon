import { Auth } from "@/stores/account/types";
import { AccountKind, createSessionHandle, loginToken, SessionHandle } from "pawnote";
import { useAccountStore } from "@/stores/account";

/**
 * Refreshes the Pronote account credentials using the provided authentication data.
 * @param credentials
 * @returns {Promise<Auth>} A promise that resolves to the updated authentication data.
 */
export async function refreshPronoteAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: SessionHandle}> {
  const handle = createSessionHandle();
  const refresh = await loginToken(handle, {
    url: String(credentials.additionals?.["instanceURL"] || ""),
    kind: (credentials.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
    username: String(credentials.additionals?.["username"] || ""),
    token: String(credentials.refreshToken ?? ""),
    deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
  });

  const auth: Auth = {
    accessToken: refresh.token,
    refreshToken: refresh.token,
    additionals: {
      instanceURL: refresh.url,
      kind: refresh.kind,
      username: refresh.username,
      deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
    },
  }

  useAccountStore.getState().updateServiceAuthData(accountId, auth)

  return {
    auth: auth,
    session: handle
  };
}