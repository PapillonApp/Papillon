import { Session } from "pawdirecte";
import { SessionHandle } from "pawnote";
import { Skolengo as SkolengoSession } from "skolengojs";

import { Pronote } from "@/services/pronote";
import { Attendance } from "@/services/shared/attendance";
import {
  Booking,
  BookingDay,
  CanteenHistoryItem,
  CanteenMenu,
  QRCode,
} from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import { Auth, Services } from "@/stores/account/types";

import { EcoleDirecte } from "../ecoledirecte";
import { Skolengo } from "../skolengo";
import { Kid } from "./kid";
import { Client as TurboselfClient } from "turboself-api";
import { Client as ArdClient } from "pawrd";
import { Multi as MultiClient } from "esup-multi.js";
import { TurboSelf } from "../turboself";
import { ARD } from "../ard";
import { Balance } from "./balance";
import { Izly } from "../izly";
import { Identification } from "ezly";
import { Multi } from "../multi";

/** Represents a plugin for a school service.
 *
 * @property {string} displayName - The name of the service displayed to the user.
 * @property {Services} service - The identifier for the service.
 * @property {function} refreshAccount - Function used to refresh the account credentials.
 */
export interface SchoolServicePlugin {
  displayName: string;
  service: Services;
  capabilities: Capabilities[];
  authData: Auth;
  session:
    | ArdClient
    | Identification
    | MultiClient
    | SessionHandle
    | Session
    | SkolengoSession
    | TurboselfClient
    | undefined;

  refreshAccount: (
    credentials: Auth
  ) => Promise<
    Pronote | Skolengo | EcoleDirecte | TurboSelf | ARD | Izly | Multi
  >;
  getKids?: () => Kid[];
  getHomeworks?: (weekNumber: number) => Promise<Homework[]>;
  getNews?: () => Promise<News[]>;
  getGradesForPeriod?: (period: Period, kid?: Kid) => Promise<PeriodGrades>;
  getGradesPeriods?: () => Promise<Period[]>;
  getAttendanceForPeriod?: (period: string) => Promise<Attendance>;
  getAttendancePeriods?: () => Promise<Period[]>;
  getWeeklyCanteenMenu?: (startDate: Date) => Promise<CanteenMenu[]>;
  getChats?: () => Promise<Chat[]>;
  getChatRecipients?: (chat: Chat) => Promise<Recipient[]>;
  getChatMessages?: (chat: Chat) => Promise<Message[]>;
  getRecipientsAvailableForNewChat?: () => Promise<Recipient[]>;
  getCourseResources?: (course: Course) => Promise<CourseResource[]>;
  getWeeklyTimetable?: (weekNumber: number) => Promise<CourseDay[]>;
  sendMessageInChat?: (chat: Chat, content: string) => Promise<void>;
  setNewsAsAcknowledged?: (news: News) => Promise<News>;
  setHomeworkCompletion?: (
    homework: Homework,
    state?: boolean
  ) => Promise<Homework>;
  createMail?: (
    subject: string,
    content: string,
    recipients: Recipient[],
    cc?: Recipient[],
    bcc?: Recipient[]
  ) => Promise<Chat>;
  getCanteenBalances?: () => Promise<Balance[]>;
  getCanteenTransactionsHistory?: () => Promise<CanteenHistoryItem[]>;
  getCanteenQRCodes?: () => Promise<QRCode>;
  getCanteenBookingWeek?: (weekNumber: number) => Promise<BookingDay[]>;
  setMealAsBooked?: (meal: Booking, booked?: boolean) => Promise<Booking>;
}

/*
 *
 * Represents the capabilities of a school service plugin.
 * Used to determine what features the plugin supports.
 */
export enum Capabilities {
  REFRESH,
  HOMEWORK,
  NEWS,
  GRADES,
  ATTENDANCE,
  ATTENDANCE_PERIODS,
  CANTEEN_MENU,
  CHAT_READ,
  CHAT_CREATE,
  CHAT_REPLY,
  TIMETABLE,
  HAVE_KIDS,
  CANTEEN_BALANCE,
  CANTEEN_HISTORY,
  CANTEEN_BOOKINGS,
  CANTEEN_QRCODE,
}

/**
 * Represents a generic interface for objects that have a createdByAccount property.
 *
 * @property {string} createdByAccount - The local account that created the object, useful for the manager.
 */
export interface GenericInterface {
  createdByAccount: string;
  fromCache?: boolean;
  kidName?: string;
}

export type FetchOptions<T> = {
  clientId?: string;
  fallback?: () => Promise<T>;
  saveToCache?: (data: T) => Promise<void>;
};
