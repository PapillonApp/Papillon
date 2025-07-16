import { AccountKind, assignmentsFromWeek,createSessionHandle, loginToken } from "pawnote";

import { Homework, ReturnFormat } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { fetchPronoteHomeworks } from "@/services/pronote/homework";
import { error } from "@/utils/logger/logger";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { News } from "@/services/shared/news";
import { fetchPronoteNews } from "@/services/pronote/news";

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
      return await fetchPronoteHomeworks(this.session, this.accountId)
    }

    error("Session is not initialized. Please refresh the account first.", "Pronote.getHomeworks");
    return [];
  }

  async getNews(): Promise<Array<News>> {
    if (this.session) {
      return await fetchPronoteNews(this.session, this.accountId)
    }

    error("Session is not initialized. Please refresh the account first.", "Pronote.getHomeworks");
    return [];
  }
}
