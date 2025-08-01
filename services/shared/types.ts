import { SessionHandle } from "pawnote";

import { Pronote } from "@/services/pronote";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseResource } from "@/services/shared/timetable";
import { Auth, Services } from "@/stores/account/types";
import { Skolengo as SkolengoSession } from "skolengojs";
import { Skolengo } from "../skolengo";

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
  session: SessionHandle | SkolengoSession | undefined;

  refreshAccount: (credentials: Auth) => Promise<Pronote | Skolengo>;
  getHomeworks?: (date: Date) => Promise<Homework[]>;
  getNews?: () => Promise<News[]>;
  getGradesForPeriod?: (period: string) => Promise<PeriodGrades>;
  getGradesPeriods?: () => Promise<Period[]>;
  getAttendanceForPeriod?: (period: string) => Promise<Attendance>;
  getAttendancePeriods?: () => Promise<Period[]>;
  getWeeklyCanteenMenu?: (startDate: Date) => Promise<CanteenMenu[]>;
  getChats?: () => Promise<Chat[]>;
  getChatRecipients?: (chat: Chat) => Promise<Recipient[]>;
  getChatMessages?: (chat: Chat) => Promise<Message[]>;
  getRecipientsAvailableForNewChat?: () => Promise<Recipient[]>;
  getCourseResources?: (course: Course) => Promise<CourseResource[]>;
  getWeeklyTimetable?: (date: Date) => Promise<CourseDay[]>;
  sendMessageInChat?: (chat: Chat, content: string) => Promise<void>;
  setNewsAsAcknowledged?: (news: News) => Promise<News>;
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
  CANTEEN_MENU,
  CHAT_READ,
  CHAT_WRITE,
  TIMETABLE
}

/**
 * Represents a generic interface for objects that have a createdByAccount property.
 *
 * @property {string} createdByAccount - The local account that created the object, useful for the manager.
 */
export interface GenericInterface {
  createdByAccount: string;
  fromCache?: boolean;
}

export type FetchOptions<T> = {
  clientId?: string;
  fallback?: () => Promise<T>;
  saveToCache?: (data: T) => Promise<void>;
};