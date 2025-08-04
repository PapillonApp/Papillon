import { Auth, Services } from "@/stores/account/types";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { refreshEDAccount } from "./refresh";
import { Account, Session } from "pawdirecte";
import { Homework } from "../shared/homework";
import { error } from "@/utils/logger/logger";
import { fetchEDHomeworks } from "./homework";
import { News } from "../shared/news";
import { fetchEDNews } from "./news";
import { Period, PeriodGrades } from "../shared/grade";
import { fetchEDGradePeriods, fetchEDGrades } from "./grades";

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
	account: Account | undefined = undefined;
	authData: Auth = {};

	constructor(public accountId: string) {}

	async refreshAccount(credentials: Auth): Promise<EcoleDirecte> {
		const refresh = (await refreshEDAccount(this.accountId, credentials))

		this.authData = refresh.auth
		this.account = refresh.account
		this.session = refresh.session

		return this;
	}

	async getHomeworks(weekNumber: number): Promise<Homework[]> {
		if (this.session && this.account) {
			return fetchEDHomeworks(this.session, this.account, this.accountId, weekNumber);
		}
		error("Session or account is not valid", "EcoleDirecte.getHomeworks")
	}

	async getNews(): Promise<News[]> {
		if (this.session && this.account) {
			return fetchEDNews(this.session, this.account, this.accountId);
		}

		error("Session or account is not valid", "EcoleDirecte.getNews");
	}

	async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
		if (this.session && this.account) {
			return fetchEDGrades(this.session, this.account, this.accountId, period)
		}
		
		error("Session or account is not valid", "EcoleDirecte.getGradesForPeriod");
	}

	async getGradesPeriods(): Promise<Period[]> {
		if (this.session && this.account) {
			return fetchEDGradePeriods(this.session, this.account, this.accountId)
		}
		
		error("Session or account is not valid", "EcoleDirecte.getGradesPeriods");
	}
}