import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { fetchPronoteHomeworks } from "@/services/pronote/homework";
import { error } from "@/utils/logger/logger";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { News } from "@/services/shared/news";
import { fetchPronoteNews, setPronoteNewsAsAcknowledged } from "@/services/pronote/news";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { fetchPronoteGrades, fetchPronotePeriods } from "@/services/pronote/grades";

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  capabilities = [Capabilities.HOMEWORK, Capabilities.NEWS];
  session = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    this.authData = await refreshPronoteAccount(credentials);
    return this;
  }

  async getHomeworks(date: Date): Promise<Array<Homework>> {
    if (this.session) {
      return fetchPronoteHomeworks(this.session, this.accountId, date);
    }

    error("Session is not valid", "Pronote.getHomeworks");
  }

  async getNews(): Promise<Array<News>> {
    if (this.session) {
      return fetchPronoteNews(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getNews");
  }

  async getGradesForPeriod(period: string): Promise<PeriodGrades> {
    if (this.session) {
      return fetchPronoteGrades(this.session, this.accountId, period);
    }

    error("Session is not valid", "Pronote.getNews");
  }

  async getPeriods(): Promise<Array<Period>> {
    if (this.session) {
      return fetchPronotePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getNews");
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    if (this.session) {
      return setPronoteNewsAsAcknowledged(this.session, news);
    }

    error("Session is not valid", "Pronote.setNewsAsAcknowledged");
  }
}
