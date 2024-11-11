import type { TurboselfAccount } from "@/stores/account/types";
import { authenticateWithCredentials } from "turboself-api";

export const reload = async (account: TurboselfAccount): Promise<TurboselfAccount["authentication"]> => {
  const auth = { ...account.authentication };
  const session = await authenticateWithCredentials(auth.username, auth.password);
  return {
    session,
    username: auth.username,
    password: auth.password
  };
};
