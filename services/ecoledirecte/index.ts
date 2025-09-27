import { Account, Session } from "pawdirecte";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { Chat, Message } from "../shared/chat";
import { Period, PeriodGrades } from "../shared/grade";
import { Homework } from "../shared/homework";
import { News } from "../shared/news";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchEDAttendance } from "./attendance";
import { fetchEDChatMessage, fetchEDChats } from "./chat";
import { fetchEDGradePeriods, fetchEDGrades } from "./grades";
import { fetchEDHomeworks, setEDHomeworkAsDone } from "./homework";
import { fetchEDNews } from "./news";
import { refreshEDAccount } from "./refresh";
import { fetchEDTimetable } from "./timetable";
import { QRCode } from "@/services/shared/canteen";
import { fetchEDQRCode } from "@/services/ecoledirecte/qrcode";
import { Balance } from "@/services/shared/balance";
import { fetchEDBalances } from "@/services/ecoledirecte/balance";

export class EcoleDirecte implements SchoolServicePlugin {
  displayName = "EcoleDirecte";
  service = Services.ECOLEDIRECTE;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH, 
    Capabilities.NEWS, 
    Capabilities.ATTENDANCE, 
    Capabilities.CHAT_READ,
    Capabilities.GRADES,
    Capabilities.HOMEWORK,
    Capabilities.TIMETABLE,
    Capabilities.CANTEEN_QRCODE,
    Capabilities.CANTEEN_BALANCE,
  ];
  session: Session | undefined = undefined;
  account: Account | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<EcoleDirecte> {
    const refresh = (await refreshEDAccount(this.accountId, credentials))

    this.authData = refresh.auth
    this.account = refresh.account
    this.session = refresh.session

    return this;
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session && this.account) {
      return fetchEDHomeworks(this.session, this.account, this.accountId, weekNumber);
    }
    error("Session or account is not valid", "EcoleDirecte.getHomeworks")
  }

  async getNews(): Promise<News[]> {
    if (this.session && this.account) {
      return fetchEDNews(this.session, this.account, this.accountId);
    }

    error("Session or account is not valid", "EcoleDirecte.getNews");
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    if (this.session && this.account) {
      return fetchEDGrades(this.session, this.account, this.accountId, period)
    }
		
    error("Session or account is not valid", "EcoleDirecte.getGradesForPeriod");
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (this.session && this.account) {
      return fetchEDGradePeriods(this.session, this.account, this.accountId)
    }
		
    error("Session or account is not valid", "EcoleDirecte.getGradesPeriods");
  }

  async getAttendanceForPeriod(): Promise<Attendance> {
    if (this.session && this.account) {
      return fetchEDAttendance(this.session, this.account, this.accountId);
    }

    error("Session or account is not valid", "EcoleDirecte.getAttendanceForPeriod");
  }

  async getWeeklyTimetable(weekNumber: number): Promise<CourseDay[]> {
    if (this.session && this.account) {
      return fetchEDTimetable(this.session, this.account, this.accountId, weekNumber)
    }

    error("Session or account is not valid", "EcoleDirecte.getWeeklyTimetable")
  }

  async getChats(): Promise<Chat[]> {
    if (this.session && this.account) {
      return fetchEDChats(this.session, this.account, this.accountId);
    }

    error("Session or account is not valid", "EcoleDirecte.getChats");
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    if (this.session && this.account) {
      return fetchEDChatMessage(this.session, this.account, this.accountId, chat);
    }

    error("Session or account is not valid", "EcoleDirecte.getChats");
  }

  async setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    if (this.session && this.account) {
      return setEDHomeworkAsDone(this.session, this.account, homework, state)
    }

    error("Session or account is not valid", "EcoleDirecte.setHomeworkCompletion");
  }

  async getCanteenQRCodes(): Promise<QRCode> {
    if (this.session && this.account) {
      return fetchEDQRCode(this.account)
    }

    error("Session is not valid", "EcoleDirecte.getCanteenQRCodes")
  }

  async getCanteenBalances(): Promise<Balance[]> {
    if (this.session && this.account) {
      return (await fetchEDBalances(this.session)).map(balance => ({
        ...balance,
        createdByAccount: this.accountId,
      }))
    }

    error("Session is not valid", "EcoleDirecte.getCanteenBalances")
  }
}