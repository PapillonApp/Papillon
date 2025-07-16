import { Auth } from "@/stores/account/types";
import { AccountKind, createSessionHandle, loginToken } from "pawnote";

export async function refreshPronoteAccount(
  credentials: Auth
): Promise<Auth> {
  const handle = createSessionHandle();
  const auth = await loginToken(handle, {
    url: String(credentials.additionals?.["instanceURL"] || ""),
    kind: (credentials.additionals?.["kind"] as AccountKind) || AccountKind.STUDENT,
    username: String(credentials.additionals?.["username"] || ""),
    token: String(credentials.refreshToken ?? ""),
    deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
  });

  return {
    accessToken: auth.token,
    refreshToken: auth.token,
    additionals: {
      instanceURL: auth.url,
      kind: auth.kind,
      username: auth.username,
      deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
    },
  };
}