import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import { useUnivRennes1Login } from "./login";

export async function refreshRennes1Account(accountId: string, credentials: Auth): Promise<{ auth: Auth, session: Session, account: Account }> {
  const session = (credentials.session) as unknown as Session;
  const UnivRennes1Login = useUnivRennes1Login();

  const username = credentials.additionnals["username"];
  const password = credentials.additionnals["password"];

  const account = await UnivRennes1Login.login(username, password);

  useAccountStore.getState().updateServiceAuthData(accountId, credentials);

  return {
    auth: credentials,
    session: null,
    account: account
  }
}