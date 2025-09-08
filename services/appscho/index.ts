import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { User } from "appscho";
import { refreshAppSchoAccount } from "./refresh";
import { error } from "@/utils/logger/logger";

export class Appscho implements SchoolServicePlugin {
  displayName = "AppScho";
  service = Services.APPSCHO;
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.TIMETABLE, Capabilities.NEWS];
  session: User | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Appscho> {
    try {
      const refresh = await refreshAppSchoAccount(this.accountId, credentials);
      
      this.authData = refresh.auth;
      this.session = refresh.session;
      
      return this;
    } catch (refreshError) {
      error(`Failed to refresh AppScho account: ${refreshError}`, "Appscho.refreshAccount");
      throw refreshError;
    }
  }

}