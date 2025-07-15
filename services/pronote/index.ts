import { SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { AccountKind, createSessionHandle, loginToken } from "pawnote";

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  authData: Auth = {}

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    const handle = createSessionHandle();
    const auth = await loginToken(handle, {
      url: String(credentials.additionals?.["instanceURL"] || ""),
      kind: credentials.additionals?.["kind"] as AccountKind || AccountKind.STUDENT,
      username: String(credentials.additionals?.["username"] || ""),
      token: String(credentials.refreshToken ?? ""),
      deviceUUID: String(credentials.additionals?.["deviceUUID"] || "")
    });

    this.authData = {
      accessToken: auth.token,
      refreshToken: auth.token,
      additionals: {
        instanceURL: auth.url,
        kind: auth.kind,
        username: auth.username,
        deviceUUID: String(credentials.additionals?.["deviceUUID"] || "")
      }
    }

    return this;
  }
}
