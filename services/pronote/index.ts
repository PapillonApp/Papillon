import { AccountKind, assignmentsFromWeek, createSessionHandle, loginToken, SessionHandle } from "pawnote";

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
    return this.fetchData(fetchPronoteHomeworks);
  }

  async getNews(): Promise<Array<News>> {
    return this.fetchData(fetchPronoteNews);
  }

  private async fetchData<T>(fetchFn: (session: SessionHandle, accountId: string) => Promise<T[]>): Promise<T[]> {
    if (this.session) {
      return await fetchFn(this.session, this.accountId);
    }

    error("Session is not initialized. Please refresh the account first.", `Pronote.${fetchFn.name}`);
    return [];
  }
}
