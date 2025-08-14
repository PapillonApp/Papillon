import { Account, AccountKind, refresh,Session } from "pawdirecte"

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

export async function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Session, account: Account }> {
  const session = (credentials.session) as unknown as Session
  const accounts = await refresh(session, AccountKind.Student);
  const auth: Auth = {
    session
  }

  if (accounts.length === 0 ) {
    error("This account seems to be empty")
  }

  useAccountStore.getState().updateServiceAuthData(accountId, auth);

  return {
    auth,
    session,
    account: accounts[0]
  }
}