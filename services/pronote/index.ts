import { AccountKind, assignmentsFromWeek, createSessionHandle, loginToken, SessionHandle } from "pawnote";

import { Homework, ReturnFormat } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { fetchPronoteHomeworks } from "@/services/pronote/homework";
import { error } from "@/utils/logger/logger";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { News } from "@/services/shared/news";
import { fetchPronoteNews, setPronoteNewsAsAcknowledged } from "@/services/pronote/news";

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

  async getHomeworks(): Promise<Array<Homework>> {
    if (this.session) {
      return fetchPronoteHomeworks(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getHomeworks");
    return []
  }

  async getNews(): Promise<Array<News>> {
    if (this.session) {
      return fetchPronoteNews(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getNews");
    return [];
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    if (this.session) {
      return setPronoteNewsAsAcknowledged(this.session, news);
    }

    error("Session is not valid", "Pronote.setNewsAsAcknowledged");
    return news;
  }
}
