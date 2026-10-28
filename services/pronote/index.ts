import { SessionHandle, TabLocation } from "@blockshub/pawnote-lts";

import { assertSessionUsable, getAuthState, reportSessionError } from "@/services/auth/coordinator";
import { AuthStep } from "@/services/auth/types";
import { fetchPronoteAttendance, fetchPronoteAttendancePeriods } from "@/services/pronote/attendance";
import { fetchPronoteCanteenMenu } from "@/services/pronote/canteen";
import {
  createPronoteMail,
  fetchPronoteChatMessages,
  fetchPronoteChatRecipients,
  fetchPronoteChats,
  fetchPronoteRecipients, sendPronoteMessageInChat,
} from "@/services/pronote/chat";
import { classifyPronoteError } from "@/services/pronote/errors";
import { fetchPronoteGradePeriods, fetchPronoteGrades } from "@/services/pronote/grades";
import { fetchPronoteHomeworks, setPronoteHomeworkAsDone } from "@/services/pronote/homework";
import { fetchPronoteNews, setPronoteNewsAsAcknowledged } from "@/services/pronote/news";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { fetchPronoteCourseResources, fetchPronoteWeekTimetable } from "@/services/pronote/timetable";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

const PRONOTE_TOKEN_TTL_MS = 5 * 60 * 1000;

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session : SessionHandle | undefined = undefined;
  tokenExpiration = 0;
  authData: Auth = {};

  constructor(public accountId: string) {}

  // The auth state has the last word: once the session expired, failed or
  // was reset, the one in memory is not trusted anymore.
  isTokenValid(): boolean {
    return (
      Boolean(this.session) &&
      Date.now() < this.tokenExpiration &&
      getAuthState(this.accountId)?.step === AuthStep.Ready
    );
  }

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    const refresh = (await refreshPronoteAccount(this.accountId, credentials));
    this.authData = refresh.auth;
    this.session = refresh.session;
    this.tokenExpiration = Date.now() + PRONOTE_TOKEN_TTL_MS;
    this.capabilities = [Capabilities.REFRESH];

    const tabCapabilities: Partial<Record<TabLocation, Capabilities | Capabilities[]>> = {
      [TabLocation.Assignments]: Capabilities.HOMEWORK,
      [TabLocation.Discussions]: [Capabilities.CHAT_READ, Capabilities.CHAT_REPLY, Capabilities.CHAT_CREATE],
      [TabLocation.Grades]: Capabilities.GRADES,
      [TabLocation.Notebook]: [Capabilities.ATTENDANCE, Capabilities.ATTENDANCE_PERIODS],
      [TabLocation.News]: Capabilities.NEWS,
      [TabLocation.Menus]: Capabilities.CANTEEN_MENU,
      [TabLocation.Timetable]: Capabilities.TIMETABLE,
    };

    for (const tab of this.session.user?.authorizations?.tabs ?? []) {
      const capability = tabCapabilities[tab];
      if (capability) {
        this.capabilities.push(...(Array.isArray(capability) ? capability : [capability]));
      }
    }
		
    return this;
  }

  /**
   * Runs a request on a valid session. A session the server expired is
   * renewed and the request replayed once; an IP suspension is recorded so no
   * request goes out until it ends.
   */
  private async withSession<T>(request: (session: SessionHandle) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      assertSessionUsable(this.accountId);
      if (!this.isTokenValid()) {
        await this.refreshAccount(this.authData);
      }

      const session = this.session;
      if (!session) {
        throw error("Session is not valid", "Pronote.withSession");
      }

      try {
        return await request(session);
      } catch (e) {
        const reason = classifyPronoteError(e);
        // A parallel request may already have renewed it: nothing to record then.
        if ((reason === "session_expired" || reason === "suspended") && session === this.session) {
          reportSessionError(this.accountId, reason, e);
        }
        // The server refused the request, so nothing was written: replaying is safe.
        if (reason === "session_expired" && attempt === 0) {
          continue;
        }
        throw e;
      }
    }
  }

  getHomeworks(weekNumber: number): Promise<Homework[]> {
    return this.withSession(session => fetchPronoteHomeworks(session, this.accountId, weekNumber));
  }

  getNews(): Promise<News[]> {
    return this.withSession(session => fetchPronoteNews(session, this.accountId));
  }

  getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    return this.withSession(session => fetchPronoteGrades(session, this.accountId, period));
  }

  getGradesPeriods(): Promise<Period[]> {
    return this.withSession(session => fetchPronoteGradePeriods(session, this.accountId));
  }

  getAttendanceForPeriod(period: string): Promise<Attendance> {
    return this.withSession(session => fetchPronoteAttendance(session, this.accountId, period));
  }

  getAttendancePeriods(): Promise<Period[]> {
    return this.withSession(session => fetchPronoteAttendancePeriods(session, this.accountId));
  }

  getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    return this.withSession(session => fetchPronoteCanteenMenu(session, this.accountId, startDate));
  }

  getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    return this.withSession(session => fetchPronoteWeekTimetable(session, this.accountId, weekNumber, date));
  }

  getCourseResources(course: Course): Promise<CourseResource[]> {
    return this.withSession(session => fetchPronoteCourseResources(session, course));
  }

  getChats(): Promise<Chat[]> {
    return this.withSession(session => fetchPronoteChats(session, this.accountId));
  }

  getChatRecipients(chat: Chat): Promise<Recipient[]> {
    return this.withSession(session => fetchPronoteChatRecipients(session, chat));
  }

  getChatMessages(chat: Chat): Promise<Message[]> {
    return this.withSession(session => fetchPronoteChatMessages(session, this.accountId, chat));
  }

  getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    return this.withSession(session => fetchPronoteRecipients(session));
  }

  sendMessageInChat(chat: Chat, content: string): Promise<void> {
    return this.withSession(session => sendPronoteMessageInChat(session, chat, content));
  }

  setNewsAsAcknowledged(news: News): Promise<News> {
    return this.withSession(session => setPronoteNewsAsAcknowledged(session, news));
  }

  setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    return this.withSession(session => setPronoteHomeworkAsDone(session, homework, state));
  }

  createMail(subject: string, content: string, recipients: Recipient[]): Promise<Chat> {
    return this.withSession(session => createPronoteMail(session, this.accountId, subject, content, recipients));
  }
}
