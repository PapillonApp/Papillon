import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { Account, AccountKind, Session, refresh } from "pawdirecte"

export async function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Session, accounts: Account[]}> {
	let session = (credentials.session) as unknown as Session
	const accounts = await refresh(session, AccountKind.Student);
	const auth: Auth = {
		session
	}

	useAccountStore.getState().updateServiceAuthData(accountId, auth);

	return {
		auth,
		session,
		accounts
	}
}