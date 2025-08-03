import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { Skolengo } from "skolengojs";

export async function refreshSkolengoAccount(
	accountId: string,
	session: Skolengo
): Promise<{auth: Auth, session: Skolengo}> {
	await session.refreshAccessToken();
	const authData: Auth = {
		session
	}

	useAccountStore.getState().updateServiceAuthData(accountId, authData)

	return { auth: authData, session }
}