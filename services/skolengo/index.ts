import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { Skolengo as SkolengoSession } from "skolengojs";
import { refreshSkolengoAccount } from "./refresh";
import { error } from "@/utils/logger/logger";
import { Homework } from "../shared/homework";
import { fetchSkolengoHomeworks } from "./homework";

export class Skolengo implements SchoolServicePlugin {
	displayName = "Skolengo";
	service = Services.SKOLENGO;
	capabilities: Capabilities[] = [Capabilities.REFRESH];
	session: SkolengoSession | undefined = undefined;
	authData: Auth = {};

	constructor(public accountId: string){}

	async refreshAccount(credentials: Auth): Promise<Skolengo> {
		if (!credentials.session) {
			error("This account seems to not be initialized")
		}

		const refresh = (await refreshSkolengoAccount(this.accountId, credentials.session))
		this.authData = refresh.auth
		this.session = refresh.session

		return this;
	}

	async getHomeworks(weekNumber: number): Promise<Homework[]> {
			if (this.session) {
				return fetchSkolengoHomeworks(this.session, this.accountId, weekNumber);
			}
	
			error("Session is not valid", "Pronote.getHomeworks");
		}
	
}