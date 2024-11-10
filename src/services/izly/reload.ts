import type { IzlyAccount } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import {Identification, refresh} from "ezly";

export const reload = async (account: IzlyAccount): Promise<Identification> => {
  const instance = account.authentication.identification;
  const secret = account.authentication.secret;

  await refresh(instance, secret);
  log("session refreshed", "izly");
  return instance;
};