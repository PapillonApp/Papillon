import { SessionHandle, TabLocation } from "pawnote";

import { fetchPronoteAttendance, fetchPronoteAttendancePeriods } from "@/services/pronote/attendance";
import { fetchPronoteCanteenMenu } from "@/services/pronote/canteen";
import {
  createPronoteMail,
  fetchPronoteChatMessages,
  fetchPronoteChatRecipients,
  fetchPronoteChats,
  fetchPronoteRecipients, sendPronoteMessageInChat,
} from "@/services/pronote/chat";
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

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session : SessionHandle | undefined = undefined;
  tokenExpiration = new Date().getTime() + (5 * 60 * 1000);
  authData: Auth = {};

  constructor(public accountId: string) {}

  private async checkTokenValidty(): Promise<boolean> {
    const time = new Date().getTime();
    if (time > this.tokenExpiration) {
      this.tokenExpiration = new Date().getTime() + (5 * 60 * 1000);
      await this.refreshAccount(this.authData);
      return new Date().getTime() <= this.tokenExpiration;
    }
    return true;
  }

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    const refresh = (await refreshPronoteAccount(this.accountId, credentials));
    this.authData = refresh.auth;
    this.session = refresh.session;

    const tabCapabilities: Partial<Record<TabLocation, Capabilities | Capabilities[]>> = {
      [TabLocation.Assignments]: Capabilities.HOMEWORK,
      [TabLocation.Discussions]: [Capabilities.CHAT_READ, Capabilities.CHAT_REPLY, Capabilities.CHAT_CREATE],
      [TabLocation.Grades]: Capabilities.GRADES,
      [TabLocation.Notebook]: [Capabilities.ATTENDANCE, Capabilities.ATTENDANCE_PERIODS],
      [TabLocation.News]: Capabilities.NEWS,
      [TabLocation.Menus]: Capabilities.CANTEEN_MENU,
      [TabLocation.Timetable]: Capabilities.TIMETABLE,
    };

    for (const tab of this.session.user.authorizations.tabs) {
      const capability = tabCapabilities[tab];
      if (capability) {
        this.capabilities.push(...(Array.isArray(capability) ? capability : [capability]));
      }
    }
		
    return this;
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteHomeworks(this.session, this.accountId, weekNumber);
    }

    error("Session is not valid", "Pronote.getHomeworks");
  }

  async getNews(): Promise<News[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteNews(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getNews");
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteGrades(this.session, this.accountId, period);
    }

    error("Session is not valid", "Pronote.getGradesForPeriod");
  }

  async getGradesPeriods(): Promise<Period[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteGradePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getGradesPeriods");
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteAttendance(this.session, this.accountId, period);
    }

    error("Session is not valid", "Pronote.getAttendanceForPeriod");
  }

  async getAttendancePeriods(): Promise<Period[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteAttendancePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getAttendancePeriods");
  }

  async getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteCanteenMenu(this.session, this.accountId, startDate);
    }

    error("Session is not valid", "Pronote.getWeeklyCanteenMenu");
  }

  async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteWeekTimetable(this.session, this.accountId, weekNumber, date);
    }

    error("Session is not valid", "Pronote.getWeeklyTimetable");
  }

  async getCourseResources(course: Course): Promise<CourseResource[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteCourseResources(this.session, course);
    }

    error("Session is not valid", "Pronote.getWeeklyTimetable");
  }

  async getChats(): Promise<Chat[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteChats(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getChats");
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteChatRecipients(this.session, chat);
    }

    error("Session is not valid", "Pronote.getChatRecipients");
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteChatMessages(this.session, this.accountId, chat);
    }

    error("Session is not valid", "Pronote.getChatMessages");
  }

  async getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    await this.checkTokenValidty()

    if (this.session) {
      return fetchPronoteRecipients(this.session);
    }

    error("Session is not valid", "Pronote.getRecipientsAvailableForNewChat");
  }

  async sendMessageInChat(chat: Chat, content: string): Promise<void> {
    await this.checkTokenValidty()

    if (this.session) {
      await sendPronoteMessageInChat(this.session, chat, content);
    }

    error("Session is not valid", "Pronote.sendMessageInChat");
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    await this.checkTokenValidty()

    if (this.session) {
      return setPronoteNewsAsAcknowledged(this.session, news);
    }

    error("Session is not valid", "Pronote.setNewsAsAcknowledged");
  }

  async setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    await this.checkTokenValidty()

    if (this.session) {
      return setPronoteHomeworkAsDone(this.session, homework, state)
    }
    error("Session is not valid", "Pronote.setHomeworkCompletion")
  }

  async createMail(subject: string, content: string, recipients: Recipient[]): Promise<Chat> {
    await this.checkTokenValidty()

    if (this.session) {
      return createPronoteMail(this.session, this.accountId, subject, content, recipients)
    }

    error("Session is not valid", "Skolengo.createMail")
  }
}
