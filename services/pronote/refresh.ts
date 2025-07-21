import { Auth } from "@/stores/account/types";
import { AccountKind, createSessionHandle, loginToken, SessionHandle } from "pawnote";

/**
 * Refreshes the Pronote account credentials using the provided authentication data.
 * @param credentials
 * @returns {Promise<Auth>} A promise that resolves to the updated authentication data.
 */
export async function refreshPronoteAccount(
  credentials: Auth
): Promise<{auth: Auth, session: SessionHandle}> {
  const handle = createSessionHandle();
  const auth = await loginToken(handle, {
    url: String(credentials.additionals?.["instanceURL"] || ""),
    kind: (credentials.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
    username: String(credentials.additionals?.["username"] || ""),
    token: String(credentials.refreshToken ?? ""),
    deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
  });

  return {
    auth: {
      accessToken: auth.token,
      refreshToken: auth.token,
      additionals: {
        instanceURL: auth.url,
        kind: auth.kind,
        username: auth.username,
        deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
      },
    },
    session: handle
  };
}