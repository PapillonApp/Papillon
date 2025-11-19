import { Auth, Services } from "@/stores/account/types";

import { Capabilities, SchoolServicePlugin } from "../shared/types";

export class Lannion implements SchoolServicePlugin {
  displayName = "Lannion";
  service = Services.LANNION;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
  ];
  session: undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Lannion> {
    const refresh = await refreshMultiSession(this.accountId, credentials);

    this.authData = refresh.auth;
    this.session = refresh.session;

    return this;
  }

}
