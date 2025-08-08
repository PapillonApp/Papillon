import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { Client } from "turboself-api"
import { refreshTurboSelfAccount } from "./refresh";
import { Balance } from "../shared/balance";
import { error } from "@/utils/logger/logger";
import { fetchTurboSelfBalance } from "./balance";

export class TurboSelf implements SchoolServicePlugin {
	displayName = "TurboSelf";
	service = Services.TURBOSELF
	capabilities: Capabilities[] = [
		Capabilities.REFRESH,
		Capabilities.CANTEEN_BALANCE,
		Capabilities.CANTEEN_BOOKINGS,
		Capabilities.CANTEEN_HISTORY,
		Capabilities.CANTEEN_QRCODE
	];
	session: Client | undefined = undefined
	authData: Auth = {};

	constructor(public accountId: string) {}

	async refreshAccount(credentials: Auth): Promise<TurboSelf> {
		const refresh = await refreshTurboSelfAccount(this.accountId, credentials)

		this.authData = refresh.auth
		this.session = refresh.session

		return this;
	}

	async getCanteenBalances(): Promise<Balance[]> {
		if (this.session) {
			return fetchTurboSelfBalance(this.session, this.accountId)
		}

		error("Session is not valid", "TurboSelf.getCanteenBalances");
	}
}