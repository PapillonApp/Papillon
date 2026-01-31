import { WebUntis } from "webuntis";

import { Auth,Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { Balance } from "../shared/balance";
import { Booking,BookingDay, CanteenHistoryItem, CanteenKind, CanteenMenu, QRCode } from "../shared/canteen";
import { Chat, Message,Recipient } from "../shared/chat";
import { Period, PeriodGrades } from "../shared/grade";
import { Homework } from "../shared/homework";
import { Kid } from "../shared/kid";
import { News } from "../shared/news";
import { Course, CourseDay,CourseResource } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { refreshWebUntisAccount } from "./refresh";
import { fetchWebUntisWeekTimetable } from "./timetable";

export class WebUntisService implements SchoolServicePlugin {
  displayName = "WebUntis";
  service = Services.WEBUNTIS;
  capabilities: Capabilities[] = [Capabilities.REFRESH];
  session: WebUntis | undefined = undefined;
  authData: Auth = {};
  
  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<WebUntisService> {
    const refresh = (await refreshWebUntisAccount(this.accountId, credentials));
    this.authData = refresh.auth;
    this.session = refresh.session;

    this.capabilities.push(Capabilities.TIMETABLE)
		
    return this;
  }

  getKids?: (() => Kid[]) | undefined;
  getCanteenKind?: (() => CanteenKind) | undefined;
  getHomeworks?: ((weekNumber: number) => Promise<Homework[]>) | undefined;
  getNews?: (() => Promise<News[]>) | undefined;
  getGradesForPeriod?: ((period: Period, kid?: Kid) => Promise<PeriodGrades>) | undefined;
  getGradesPeriods?: (() => Promise<Period[]>) | undefined;
  getAttendanceForPeriod?: ((period: string) => Promise<Attendance>) | undefined;
  getAttendancePeriods?: (() => Promise<Period[]>) | undefined;
  getWeeklyCanteenMenu?: ((startDate: Date) => Promise<CanteenMenu[]>) | undefined;
  getChats?: (() => Promise<Chat[]>) | undefined;
  getChatRecipients?: ((chat: Chat) => Promise<Recipient[]>) | undefined;
  getChatMessages?: ((chat: Chat) => Promise<Message[]>) | undefined;
  getRecipientsAvailableForNewChat?: (() => Promise<Recipient[]>) | undefined;
  getCourseResources?: ((course: Course) => Promise<CourseResource[]>) | undefined;

  async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    await this.session?.validateSession();
  
    if (this.session) {
      return fetchWebUntisWeekTimetable(this.session, this.accountId, weekNumber, date);
    }

    error("Session is not valid", "WebUntis.getWeeklyTimetable");

    return [];
  }
  sendMessageInChat?: ((chat: Chat, content: string) => Promise<void>) | undefined;
  setNewsAsAcknowledged?: ((news: News) => Promise<News>) | undefined;
  setHomeworkCompletion?: ((homework: Homework, state?: boolean) => Promise<Homework>) | undefined;
  createMail?: ((subject: string, content: string, recipients: Recipient[], cc?: Recipient[], bcc?: Recipient[]) => Promise<Chat>) | undefined;
  getCanteenBalances?: (() => Promise<Balance[]>) | undefined;
  getCanteenTransactionsHistory?: (() => Promise<CanteenHistoryItem[]>) | undefined;
  getCanteenQRCodes?: (() => Promise<QRCode>) | undefined;
  getCanteenBookingWeek?: ((weekNumber: number) => Promise<BookingDay[]>) | undefined;
  setMealAsBooked?: ((meal: Booking, booked?: boolean) => Promise<Booking>) | undefined;

}