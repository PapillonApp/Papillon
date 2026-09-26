import { Kind, Permissions, Skolengo as SkolengoSession } from "skolengojs";

import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { Chat, Message, Recipient } from "../shared/chat";
import { Period, PeriodGrades } from "../shared/grade";
import { Homework } from "../shared/homework";
import { Kid } from "../shared/kid";
import { News } from "../shared/news";
import { CourseDay } from "../shared/timetable";
import { Capabilities, SchoolServicePlugin } from "../shared/types";
import { fetchSkolengoAttendance } from "./attendance";
import { createSkolengoMail, fetchSkolengoChatMessages, fetchSkolengoChatRecipients, fetchSkolengoChats } from "./chat";
import { fetchSkolengoGradePeriods, fetchSkolengoGradesForPeriod } from "./grades";
import { fetchSkolengoHomeworks, setSkolengoHomeworkAsDone } from "./homework";
import { fetchSkolengoKids } from "./kid";
import { fetchSkolengoNews } from "./news";
import { refreshSkolengoAccount } from "./refresh";
import { fetchSkolengoTimetable } from "./timetable";

export class Skolengo implements SchoolServicePlugin {
  displayName = "Skolengo";
  service = Services.SKOLENGO;
  capabilities: Capabilities[] = [Capabilities.REFRESH, Capabilities.NEWS];
  session: SkolengoSession | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string){}

  async refreshAccount(credentials: Auth): Promise<Skolengo> {
    const refresh = (await refreshSkolengoAccount(this.accountId, credentials))
    this.authData = refresh.auth
    this.session = refresh.session

    const tabCapabilities: Partial<Record<Permissions, Capabilities>> = {
      [Permissions.READ_ASSIGNMENTS]: Capabilities.HOMEWORK,
      [Permissions.READ_MESSAGES]: Capabilities.CHAT_READ,
      [Permissions.WRITE_MESSAGES]: Capabilities.CHAT_CREATE,
      [Permissions.READ_ABSENCE_FILES]: Capabilities.ATTENDANCE,
      [Permissions.READ_LESSONS]: Capabilities.TIMETABLE,
      [Permissions.READ_EVALUATIONS]: Capabilities.GRADES
    };

    for (const permission of this.session.permissions) {
      const capability = tabCapabilities[permission];
      if (capability) {
        this.capabilities.push(capability)
      }
    }

    if (this.session.kind === Kind.PARENT) {this.capabilities.push(Capabilities.HAVE_KIDS)}

    return this;
  }

  getKids(): Kid[] {
    if (this.session) {
      return fetchSkolengoKids(this.session, this.accountId)
    }

    error("Session is not valid", "Skolengo.getKids");
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session) {
      return fetchSkolengoHomeworks(this.session, this.accountId, weekNumber);
    }

    error("Session is not valid", "Skolengo.getHomeworks");
  }

  async getNews(): Promise<News[]> {
    if (this.session) {
      return fetchSkolengoNews(this.session, this.accountId);
    }

    error("Session is not valid", "Skolengo.getNews");
  }

  async getGradesForPeriod(period: Period, kid?: Kid): Promise<PeriodGrades> {
    if (kid?.ref && this.session) {
      return fetchSkolengoGradesForPeriod(this.session, this.accountId, period.id!, kid?.ref)
    }
		
    if (this.session && this.session.kind === Kind.STUDENT ) {
      return fetchSkolengoGradesForPeriod(this.session, this.accountId, period.id!);
    }
		
    error("Session is not valid", "Skolengo.getGradesForPeriod")
  }

  async getGradesPeriods(): Promise<Period[]> {
    if (this.session) {
      return fetchSkolengoGradePeriods(this.session, this.accountId);
    }

    error("Session is not valid", "Skolengo.getGradesPeriods")
  }

  async getAttendanceForPeriod(): Promise<Attendance> {
    if (this.session) {
      return fetchSkolengoAttendance(this.session, this.accountId);
    }

    error ("Session is not valid", "Skolengo.getAttendanceForPeriod")
  }

  async getWeeklyTimetable(weekNumber: number, date: Date): Promise<CourseDay[]> {
    if (this.session) {
      return fetchSkolengoTimetable(this.session, this.accountId, weekNumber)
    }
		
    error("Session is not valid", "Skolengo.getWeeklyTimetable")
  }

  async getChats(): Promise<Chat[]> {
    if (this.session) {
      return fetchSkolengoChats(this.session, this.accountId)
    }

    error("Session is not valid", "Skolengo.getChats")
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    if (this.session) {
      return fetchSkolengoChatRecipients(chat)
    }

    error("Session is not valid", "Skolengo.getChatsRecipients")
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    if (this.session) {
      return fetchSkolengoChatMessages(chat)
    }

    error("Session is not valid", "Skolengo.getChatMessages")
  }

  async setHomeworkCompletion(homework: Homework, state?: boolean): Promise<Homework> {
    return setSkolengoHomeworkAsDone(this.accountId, homework, state)
  }
	
  async createMail(subject: string, content: string, recipients: Recipient[], cc?: Recipient[], bcc?: Recipient[]): Promise<Chat> {
    if (this.session) {
      return createSkolengoMail(this.session, this.accountId, subject, content, recipients, cc, bcc)
    }

    error("Session is not valid", "Skolengo.createMail")
  }
}