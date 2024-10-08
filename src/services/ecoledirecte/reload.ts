import type { EcoleDirecteAccount } from "@/stores/account/types";
import ecoledirecte from "pawdirecte";
import type { Reconnected } from "../reload-account";
import { log } from "@/utils/logger/logger";

export const reload = async (account: EcoleDirecteAccount): Promise<Reconnected<EcoleDirecteAccount>> => {
  const authentication = account.authentication;

  // TODO: refresh returns a list of accounts. Support multiple ED accounts
  log(`Refreshing instance for ${account.name}`, "ecoledirecte");
  const refresh = await ecoledirecte.refresh(authentication.session, authentication.account.kind);
  const refreshedAccount = refresh[0];
  log(`Instance refreshed for ${refreshedAccount.username}`, "ecoledirecte");

  return {
    instance: {},
    authentication: {
      ...authentication,
      ...refreshedAccount
    }
  };
};
