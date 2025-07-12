import type {AppschoAccount} from "@/stores/account/types";
import type { Reconnected } from "../reload-account";
import { login } from "appscho";

export const reloadInstance = async (authentication: AppschoAccount["authentication"], credentials: AppschoAccount["credentials"]): Promise<Reconnected<AppschoAccount>> => {
  const session = await login(authentication.instanceAppscho, credentials.username, atob(credentials.password));
  return {
    instance: session,
    authentication: {
      instanceAppscho: authentication.instanceAppscho,
      token: session.token || ""
    }
  };
};
