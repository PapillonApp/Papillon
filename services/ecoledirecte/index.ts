import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { refreshEDAccount } from "./refresh";
import { Account, Session } from "pawdirecte";

export class EcoleDirecte implements SchoolServicePlugin {
	displayName = "EcoleDirecte";
	service = Services.ECOLEDIRECTE;
	capabilities: Capabilities[] = [
		Capabilities.REFRESH, 
		Capabilities.NEWS, 
		Capabilities.ATTENDANCE, 
		Capabilities.CHAT_CREATE, 
		Capabilities.CHAT_READ, 
		Capabilities.CHAT_REPLY,
		Capabilities.GRADES,
		Capabilities.HOMEWORK,
		Capabilities.TIMETABLE
	];
	session: Session | undefined = undefined;
	accounts: Account[] = []
	authData: Auth = {};

	constructor(public accountId: string) {}

	async refreshAccount(credentials: Auth): Promise<EcoleDirecte> {
		const refresh = (await refreshEDAccount(this.accountId, credentials))
		
		this.authData = refresh.auth
		this.accounts = refresh.accounts
		this.session = refresh.session

		return this;
	}
}