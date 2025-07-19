import { SessionHandle } from "pawnote";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Auth, Services } from "@/stores/account/types";
import { News } from "@/services/shared/news";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";

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
  session: SessionHandle | undefined;

  refreshAccount: (credentials: Auth) => Promise<Pronote>;
  getHomeworks?: (date: Date) => Promise<Array<Homework>>;
  getNews?: () => Promise<Array<News>>;
  getGradesForPeriod?: (period: string) => Promise<PeriodGrades>;
  getGradesPeriods?: () => Promise<Array<Period>>;
  getAttendanceForPeriod?: (period: string) => Promise<Attendance>;
  getAttendancePeriods?: () => Promise<Array<Period>>;
  getWeeklyCanteenMenu?: (startDate: Date) => Promise<CanteenMenu[]>;
  getChats?: () => Promise<Chat[]>;
  getChatRecipients?: (chat: Chat) => Promise<Recipient[]>;
  getChatMessages?: (chat: Chat) => Promise<Message[]>;
  getRecipientsAvailableForNewChat?: () => Promise<Recipient[]>;
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
  CHAT_WRITE
}

/**
 * Represents a generic interface for objects that have a createdByAccount property.
 *
 * @property {string} createdByAccount - The local account that created the object, useful for the manager.
 */
export interface GenericInterface {
  createdByAccount: string;
}