import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { Permissions, Skolengo as SkolengoSession } from "skolengojs";
import { refreshSkolengoAccount } from "./refresh";
import { error } from "@/utils/logger/logger";
import { Homework } from "../shared/homework";
import { fetchSkolengoHomeworks } from "./homework";
import { News } from "../shared/news";
import { fetchSkolengoNews } from "./news";

export class Skolengo implements SchoolServicePlugin {
	displayName = "Skolengo";
	service = Services.SKOLENGO;
	capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.NEWS];
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

		const tabCapabilities: Partial<Record<Permissions, Capabilities>> = {
      [Permissions.READ_ASSIGNMENTS]: Capabilities.HOMEWORK,
			[Permissions.READ_MESSAGES]: Capabilities.CHAT_READ,
			[Permissions.WRITE_MESSAGES]: Capabilities.CHAT_WRITE,
			[Permissions.READ_ABSENCE_FILES]: Capabilities.ATTENDANCE,
			[Permissions.READ_LESSONS]: Capabilities.TIMETABLE,
			[Permissions.READ_EVALUATIONS]: Capabilities.GRADES
    };

		for (const permission of this.session.permissions) {
			const capability = tabCapabilities[permission];
			if (capability) {
				this.capabilities.push(capability)
			}
		}

		return this;
	}

	async getHomeworks(weekNumber: number): Promise<Homework[]> {
		if (this.session) {
			return fetchSkolengoHomeworks(this.session, this.accountId, weekNumber);
		}

		error("Session is not valid", "Skolengo.getHomeworks");
	}

	async getNews(): Promise<News[]> {
		if (this.session) {
			return fetchSkolengoNews(this.session, this.accountId);
		}

		error("Session is not valid", "Skolengo.getNews");
	}
}