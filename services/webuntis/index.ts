import { Client } from "@blockshub/blocksdirecte";
import { User } from "appscho";
import { Multi } from "esup-multi.js";
import { Identification } from "ezly";
import { SessionHandle } from "pawnote";
import { Client } from "pawrd";
import { Skolengo } from "skolengojs";
import { Client } from "turboself-api";

import { Auth,Services } from "@/stores/account/types";

import { Alise } from "../alise";
import { Appscho } from "../appscho";
import { ARD } from "../ard";
import { EcoleDirecte } from "../ecoledirecte";
import { Izly } from "../izly";
import { Lannion } from "../lannion";
import { LannionClient } from "../lannion/module";
import { Multi } from "../multi";
import { Pronote } from "../pronote";
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
import { Skolengo } from "../skolengo";
import { TurboSelf } from "../turboself";

export class WebUntis implements SchoolServicePlugin {
  displayName: string;
  service: Services;
  capabilities: Capabilities[];
  authData: Auth;
  session: Client | Identification | Multi | SessionHandle | Skolengo | Client | Client | User | LannionClient | undefined;
  refreshAccount: (credentials: Auth) => Promise<Pronote | Skolengo | EcoleDirecte | Multi | TurboSelf | ARD | Izly | Alise | Appscho | Lannion>;
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
  getWeeklyTimetable?: ((weekNumber: number, date: Date) => Promise<CourseDay[]>) | undefined;
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