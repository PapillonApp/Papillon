import type { ARDAccount } from "@/stores/account/types";
import { Authenticator, Client } from "pawrd";

export const reload = async (account: ARDAccount): Promise<Client> => {
  const authenticator = new Authenticator();
  const client = await authenticator.fromCredentials(account.authentication.schoolID, account.authentication.username, account.authentication.password);
  return client;
};
