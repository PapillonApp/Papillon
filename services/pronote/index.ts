import { Homework } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { fetchPronoteHomeworks } from "@/services/pronote/homework";
import { error } from "@/utils/logger/logger";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { News } from "@/services/shared/news";
import { fetchPronoteNews, setPronoteNewsAsAcknowledged } from "@/services/pronote/news";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { fetchPronoteGradePeriods, fetchPronoteGrades } from "@/services/pronote/grades";
import { fetchPronoteAttendance, fetchPronoteAttendancePeriods } from "@/services/pronote/attendance";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { fetchPronoteCanteenMenu } from "@/services/pronote/canteen";
import {
  fetchPronoteChatMessages,
  fetchPronoteChatRecipients,
  fetchPronoteChats,
  fetchPronoteRecipients, sendPronoteMessageInChat,
} from "@/services/pronote/chat";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import { fetchPronoteCourseResources, fetchPronoteWeekTimetable } from "@/services/pronote/timetable";

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

  async getHomeworks(date: Date): Promise<Homework[]> {
    if (this.session) {
      return fetchPronoteHomeworks(this.session, this.accountId, date);
    }

    error("Session is not valid", "Pronote.getHomeworks");
  }

  async getNews(): Promise<News[]> {
    if (this.session) {
      return fetchPronoteNews(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getNews");
  }

  async getGradesForPeriod(period: string): Promise<PeriodGrades> {
    if (this.session) {
      return fetchPronoteGrades(this.session, this.accountId, period);
    }

    error("Session is not valid", "Pronote.getGradesForPeriod");
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (this.session) {
      return fetchPronoteGradePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getGradesPeriods");
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance> {
    if (this.session) {
      return fetchPronoteAttendance(this.session, this.accountId, period);
    }

    error("Session is not valid", "Pronote.getAttendanceForPeriod");
  }

  async getAttendancePeriods(): Promise<Period[]> {
    if (this.session) {
      return fetchPronoteAttendancePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getAttendancePeriods");
  }

  async getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    if (this.session) {
      return fetchPronoteCanteenMenu(this.session, startDate);
    }

    error("Session is not valid", "Pronote.getWeeklyCanteenMenu");
  }

  async getWeeklyTimetable(date: Date): Promise<CourseDay[]> {
    if (this.session) {
      return fetchPronoteWeekTimetable(this.session, this.accountId, date);
    }

    error("Session is not valid", "Pronote.getWeeklyTimetable");
  }

  async getCourseResources(course: Course): Promise<CourseResource[]> {
    if (this.session) {
      return fetchPronoteCourseResources(this.session, course);
    }

    error("Session is not valid", "Pronote.getWeeklyTimetable");
  }

  async getChats(): Promise<Chat[]> {
    if (this.session) {
      return fetchPronoteChats(this.session, this.accountId);
    }

    error("Session is not valid", "Pronote.getChats");
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    if (this.session) {
      return fetchPronoteChatRecipients(this.session, chat);
    }

    error("Session is not valid", "Pronote.getChatRecipients");
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    if (this.session) {
      return fetchPronoteChatMessages(this.session, this.accountId, chat);
    }

    error("Session is not valid", "Pronote.getChatMessages");
  }

  async getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    if (this.session) {
      return fetchPronoteRecipients(this.session);
    }

    error("Session is not valid", "Pronote.getRecipientsAvailableForNewChat");
  }

  async sendMessageInChat(chat: Chat, content: string): Promise<void> {
    if (this.session) {
      await sendPronoteMessageInChat(this.session, chat, content);
    }

    error("Session is not valid", "Pronote.sendMessageInChat");
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    if (this.session) {
      return setPronoteNewsAsAcknowledged(this.session, news);
    }

    error("Session is not valid", "Pronote.setNewsAsAcknowledged");
  }
}
