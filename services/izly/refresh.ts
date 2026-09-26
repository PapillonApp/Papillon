import { Auth } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { Identification, refresh } from "ezly";

export async function refreshIzlyAccount(accountId: string, credentials: Auth): Promise<{ auth: Auth; session: Identification }> {
  const session = credentials.session as Identification;
  const secret = String(credentials.additionals?.["secret"]);

  await refresh(session, secret);

  const authData: Auth = {
    session,
    additionals: {
      secret,
    },
  };

  const store = useAccountStore.getState();
  store.updateServiceAuthData(accountId, authData);

  return {
    auth: authData,
    session
  };
}