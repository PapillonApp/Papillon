import { SkolengoAccount } from "@/stores/account/types";
import { Reconnected } from "../reload-account";
import { getSkolengoAccount } from "./skolengo-account";
import { Skolengo } from "scolengo-api";

export const reload = async (account: SkolengoAccount): Promise<Reconnected<SkolengoAccount>> => {

  if(!account.instance || !(account.instance instanceof Skolengo)) {
    const {instance, authentication} = await getSkolengoAccount(account.authentication, account.userInfo);
    return {instance, authentication};
  }

  return {
    instance: account.instance,
    authentication: account.authentication
  };
};
