import {
  Capabilities,
  type SchoolServicePlugin,
} from "@/services/shared/types";
import { type Auth, Services } from "@/stores/account/types";

import { loginPrepaPlus } from "./login";

export class PrepaPlus implements SchoolServicePlugin {
  displayName = "Prépa Plus";
  service = Services.PREPA_PLUS;
  capabilities = [Capabilities.REFRESH];
  authData: Auth = {};
  session: string | undefined;

  async refreshAccount(auth: Auth) {
    const { baseUrl, username, password } = auth.additionals ?? {};
    if (
      typeof baseUrl !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      throw new Error("Prépa Plus credentials are incomplete.");
    }
    this.session = await loginPrepaPlus(baseUrl, username, password);
    this.authData = auth;
    return this;
  }
}
