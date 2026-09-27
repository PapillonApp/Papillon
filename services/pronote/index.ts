import {
  fetchPronoteAttendance,
  fetchPronoteAttendancePeriods,
} from "@/services/pronote/attendance";
import { fetchPronoteCanteenMenu } from "@/services/pronote/canteen";
import {
  createPronoteMail,
  fetchPronoteChatMessages,
  fetchPronoteChatRecipients,
  fetchPronoteChats,
  fetchPronoteRecipients,
  sendPronoteMessageInChat,
} from "@/services/pronote/chat";
import {
  fetchPronoteGradePeriods,
  fetchPronoteGrades,
} from "@/services/pronote/grades";
import { fetchPronoteEvaluations } from "@/services/pronote/evaluations";
import {
  fetchPronoteHomeworks,
  setPronoteHomeworkAsDone,
} from "@/services/pronote/homework";
import {
  fetchPronoteNews,
  setPronoteNewsAsAcknowledged,
} from "@/services/pronote/news";
import { refreshPronoteAccount } from "@/services/pronote/refresh";
import { fetchPronoteReport } from "@/services/pronote/report";
import { fetchPronoteTeachingStaff } from "@/services/pronote/staff";
import {
  fetchPronoteCourseResources,
  fetchPronoteWeekContents,
  fetchPronoteWeekTimetable,
} from "@/services/pronote/timetable";
import { Attendance } from "@/services/shared/attendance";
import { CanteenMenu } from "@/services/shared/canteen";
import { Chat, Message, Recipient } from "@/services/shared/chat";
import {
  Period,
  PeriodGrades,
  Evaluation,
  Report,
} from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { TeachingStaff } from "@/services/shared/staff";
import { Course, CourseDay, CourseResource, WeekLessonContent } from "@/services/shared/timetable";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Kid } from "@/services/shared/kid";
import { useAccountStore } from "@/stores/account";
import { Auth, Services } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.CANTEEN_MENU,
    Capabilities.CHAT_READ,
    Capabilities.CHAT_REPLY,
    Capabilities.CHAT_CREATE,
    Capabilities.TIMETABLE,
    Capabilities.TIMETABLE_PDF,
    Capabilities.GRADES,
    Capabilities.HOMEWORK,
    Capabilities.NEWS,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
    Capabilities.HAVE_KIDS,
    Capabilities.EVALUATIONS,
    Capabilities.REPORT,
    Capabilities.TEACHING_STAFF,
    Capabilities.PROFILE,
  ];
  session: any = undefined;
  tokenExpiration = 0;
  authData: Auth = {};
  private refreshInFlight: Promise<void> | null = null;

  constructor(public accountId: string) {}

  private getAuthToken(): string {
    return (
      this.authData.accessToken ||
      (this.authData.additionals?.auth_token as string) ||
      (this.authData.additionals?.authToken as string) ||
      ""
    );
  }

  private getSelectedChildName(): string | undefined {
    const account = useAccountStore
      .getState()
      .accounts.find(a => a.id === this.accountId);
    return account?.selectedChild;
  }

  private resolveChildName(kid?: Kid): string | undefined {
    if (kid) {
      const full = `${kid.firstName ?? ""} ${kid.lastName ?? ""}`.trim();
      if (full.length > 0) return full;
    }
    return this.getSelectedChildName();
  }

  private async checkTokenValidty(): Promise<void> {
    if (this.refreshInFlight) {
      await this.refreshInFlight;
      return;
    }
    // Early refresh with jitter: refresh at ~4min instead of 5min deadline
    // so parallel widgets don't stampede the single-use token at once.
    // Jitter desyncs multiple Pronote instances across accounts/widgets.
    if (Date.now() <= this.tokenExpiration - 60 * 1000) return;

    this.refreshInFlight = (async () => {
      try {
        const refresh = await refreshPronoteAccount(
          this.accountId,
          this.authData
        );
        this.authData = refresh.auth;
        this.session = refresh.session;
        // Token + password types share the same validity window.
        // Password-type accounts return refreshed:false with valid creds but must
        // not re-refresh on every call (tokenExpiration would otherwise stay 0).
        // Add 0-60s jitter to desync parallel refreshers.
        this.tokenExpiration =
          Date.now() + 4 * 60 * 1000 + Math.floor(Math.random() * 60 * 1000);
      } catch (e) {
        // Échec de refresh : on propage pour laisser le manager lever AuthenticationError
        // (écran "déconnecté / Me reconnecter") plutôt qu'un token mort en silence.
        throw e;
      }
    })().finally(() => {
      this.refreshInFlight = null;
    });

    await this.refreshInFlight;
  }

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    const refresh = await refreshPronoteAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;
    this.tokenExpiration =
      Date.now() + 4 * 60 * 1000 + Math.floor(Math.random() * 60 * 1000);

    const capabilitiesSet = new Set<Capabilities>([
      Capabilities.REFRESH,
      Capabilities.CANTEEN_MENU,
      Capabilities.TIMETABLE,
      Capabilities.TIMETABLE_PDF,
      Capabilities.GRADES,
      Capabilities.HOMEWORK,
      Capabilities.NEWS,
      Capabilities.ATTENDANCE,
      Capabilities.ATTENDANCE_PERIODS,
      Capabilities.CHAT_READ,
      Capabilities.CHAT_REPLY,
      Capabilities.CHAT_CREATE,
      Capabilities.HAVE_KIDS,
      Capabilities.EVALUATIONS,
      Capabilities.REPORT,
      Capabilities.TEACHING_STAFF,
      Capabilities.PROFILE,
    ]);

    this.capabilities = Array.from(capabilitiesSet);
    return this;
  }

  getKids(): Kid[] {
    const account = useAccountStore
      .getState()
      .accounts.find(a => a.id === this.accountId);
    if (!account?.children?.length) return [];
    return account.children.map((c: any, idx: number) => {
      const rawName: string = c.name || "";
      // Prénom = premier token, nom = reste (ordre Pronote variable, id stable).
      const parts = rawName.split(" ").filter(Boolean);
      return {
        id: c.id || `kid_${idx}_${rawName}`,
        firstName: parts[0] || rawName,
        lastName: parts.slice(1).join(" ") || "",
        class: c.grade || "",
        dateOfBirth: new Date(),
        createdByAccount: this.accountId,
      };
    });
  }

  async getProfile(kid?: Kid): Promise<import("@/services/shared/profile").StudentProfile | null> {
    await this.checkTokenValidty();
    try {
      const { PronoteApiClient } = await import("@/services/pronote/api-client");
      const data = await PronoteApiClient.getProfile(this.getAuthToken(), this.resolveChildName(kid));
      return {
        id: (data as any).id ?? null,
        name: data.name || "",
        className: data.class_name || "",
        establishment: data.establishment || "",
        address: Array.isArray(data.address) ? data.address : [],
        email: data.email || "",
        phone: data.phone || "",
        ineNumber: (data as any).ine_number || "",
        delegue: Array.isArray((data as any).delegue) ? (data as any).delegue : [],
        hasProfilePicture: Boolean((data as any).has_profile_picture ?? false),
      };
    } catch (e) {
      error(String(e), "Pronote.getProfile");
      return null;
    }
  }

  async getProfilePicture(kid?: Kid): Promise<{ picture: string | null; mime?: string } | null> {
    await this.checkTokenValidty();
    try {
      const { PronoteApiClient } = await import("@/services/pronote/api-client");
      return await PronoteApiClient.getProfilePicture(this.getAuthToken(), this.resolveChildName(kid));
    } catch (e) {
      error(String(e), "Pronote.getProfilePicture");
      return null;
    }
  }

  async requestQrCode(pin: string, kid?: Kid): Promise<{ qr: any }> {
    await this.checkTokenValidty();
    const { PronoteApiClient } = await import("@/services/pronote/api-client");
    return await PronoteApiClient.requestQrCode(this.getAuthToken(), pin, this.resolveChildName(kid));
  }

  async getSessionInfo(kid?: Kid): Promise<{ start_day: string; week: number; logged_in: boolean; last_connection: string | null }> {
    await this.checkTokenValidty();
    const { PronoteApiClient } = await import("@/services/pronote/api-client");
    return await PronoteApiClient.getSessionInfo(this.getAuthToken(), this.resolveChildName(kid));
  }

  async getCurrentPeriod(kid?: Kid): Promise<Period | null> {
    await this.checkTokenValidty();
    try {
      const { PronoteApiClient } = await import("@/services/pronote/api-client");
      const data = await PronoteApiClient.getCurrentPeriod(this.getAuthToken(), this.resolveChildName(kid));
      const p = (data as any).period;
      if (!p) return null;
      return {
        id: p.id || p.name,
        name: p.name,
        start: p.start ? new Date(p.start) : new Date(),
        end: p.end ? new Date(p.end) : new Date(),
        createdByAccount: this.accountId,
      };
    } catch {
      return null;
    }
  }

  async getTimetablePdf(day?: Date, portrait?: boolean, overflow?: number): Promise<string | null> {
    await this.checkTokenValidty();
    try {
      const { PronoteApiClient } = await import("@/services/pronote/api-client");
      const fmt = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}` : undefined;
      const res = await PronoteApiClient.getTimetablePdf(this.getAuthToken(), { day: fmt, portrait, overflow, child: this.getSelectedChildName() });
      return res.url ?? null;
    } catch (e) {
      error(String(e), "Pronote.getTimetablePdf");
      return null;
    }
  }

  async getIcalUrl(): Promise<string | null> {
    await this.checkTokenValidty();
    try {
      const { fetchPronoteIcalUrl } = await import("@/services/pronote/staff");
      return await fetchPronoteIcalUrl(this.getAuthToken(), this.getSelectedChildName());
    } catch {
      return null;
    }
  }

  async getChatParticipants(chat: Chat): Promise<string[]> {
    await this.checkTokenValidty();
    try {
      const { PronoteApiClient } = await import("@/services/pronote/api-client");
      const res = await PronoteApiClient.getChatParticipants(this.getAuthToken(), chat.id, this.getSelectedChildName());
      return res.participants || [];
    } catch {
      return [];
    }
  }

  async markChatAsRead(chat: Chat, read = true): Promise<void> {
    await this.checkTokenValidty();
    const { PronoteApiClient } = await import("@/services/pronote/api-client");
    await PronoteApiClient.markChatRead(this.getAuthToken(), chat.id, read, this.getSelectedChildName());
  }

  async deleteChat(chat: Chat): Promise<void> {
    await this.checkTokenValidty();
    const { PronoteApiClient } = await import("@/services/pronote/api-client");
    await PronoteApiClient.deleteChat(this.getAuthToken(), chat.id, this.getSelectedChildName());
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    await this.checkTokenValidty();
    return fetchPronoteHomeworks(
      this.getAuthToken(),
      this.accountId,
      weekNumber,
      this.getSelectedChildName()
    );
  }

  async getNews(opts?: { onlyUnread?: boolean }): Promise<News[]> {
    await this.checkTokenValidty();
    return fetchPronoteNews(
      this.getAuthToken(),
      this.accountId,
      this.getSelectedChildName(),
      opts?.onlyUnread ? { onlyUnread: true } : undefined
    );
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    await this.checkTokenValidty();
    return fetchPronoteGrades(
      this.getAuthToken(),
      this.accountId,
      period,
      this.getSelectedChildName()
    );
  }

  async getGradesPeriods(): Promise<Period[]> {
    await this.checkTokenValidty();
    return fetchPronoteGradePeriods(
      this.getAuthToken(),
      this.accountId,
      this.getSelectedChildName()
    );
  }

  async getEvaluationsForPeriod(
    period: Period,
    kid?: Kid
  ): Promise<Evaluation[]> {
    await this.checkTokenValidty();
    return fetchPronoteEvaluations(
      this.getAuthToken(),
      this.accountId,
      period,
      this.resolveChildName(kid)
    );
  }

  async getReportForPeriod(period: Period, kid?: Kid): Promise<Report | null> {
    await this.checkTokenValidty();
    return fetchPronoteReport(
      this.getAuthToken(),
      this.accountId,
      period,
      this.resolveChildName(kid)
    );
  }

  async getTeachingStaff(kid?: Kid): Promise<TeachingStaff[]> {
    await this.checkTokenValidty();
    return fetchPronoteTeachingStaff(
      this.getAuthToken(),
      this.resolveChildName(kid)
    );
  }

  async getAttendanceForPeriod(period: string): Promise<Attendance> {
    await this.checkTokenValidty();
    return fetchPronoteAttendance(
      this.getAuthToken(),
      this.accountId,
      period,
      this.getSelectedChildName()
    );
  }

  async getAttendancePeriods(): Promise<Period[]> {
    await this.checkTokenValidty();
    return fetchPronoteAttendancePeriods(
      this.getAuthToken(),
      this.accountId,
      this.getSelectedChildName()
    );
  }

  async getWeeklyCanteenMenu(startDate: Date): Promise<CanteenMenu[]> {
    await this.checkTokenValidty();
    return fetchPronoteCanteenMenu(
      this.getAuthToken(),
      this.accountId,
      startDate,
      this.getSelectedChildName()
    );
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date,
    childName?: string
  ): Promise<CourseDay[]> {
    await this.checkTokenValidty();
    // Enfant snapshoté à l'appel (jamais relu en live) : un switch mid-loop
    // ne mélange plus les tags kidName entre les semaines.
    const kid =
      childName !== undefined ? childName : this.getSelectedChildName();
    return fetchPronoteWeekTimetable(
      this.getAuthToken(),
      this.accountId,
      weekNumber,
      date,
      kid
    );
  }

  async getCourseResources(course: Course): Promise<CourseResource[]> {    await this.checkTokenValidty();
    // Cache DB d'abord (EDT rapide sans contenu), sinon backend on-demand.
    if (Array.isArray(course.content) && course.content.length > 0) {
      return course.content;
    }
    try {
      let fresh = await fetchPronoteCourseResources(this.getAuthToken(), course);
      // Fallback batch : le POST unitaire peut rater (id tournant, matière
      // abrégée) alors que le batch ±1j matche en heure+matière tolérante.
      if (!Array.isArray(fresh) || fresh.length === 0) {
        try {
          const fromD = course.from instanceof Date ? course.from : new Date(course.from as any);
          if (fromD && !isNaN(fromD.getTime())) {
            const from = new Date(fromD.getTime() - 86400000);
            const to = new Date(fromD.getTime() + 86400000);
            const batch = await fetchPronoteWeekContents(
              this.getAuthToken(),
              this.accountId,
              from,
              to,
              this.getSelectedChildName()
            );
            if (Array.isArray(batch) && batch.length > 0) {
              const { matchContentForCourse } = await import("@/services/pronote/timetable");
              const matched = matchContentForCourse(batch, course);
              if (Array.isArray(matched) && matched.length > 0) fresh = matched;
            }
          }
        } catch {
          // best-effort fallback only
        }
      }
      if (fresh.length > 0) {
        // Persiste pour le widget LessonContent / l'ouverture hors-ligne.
        try {
          const { getDatabaseInstance } = await import("@/database/DatabaseProvider");
          const { getCourseRouteId } = await import("@/database/useTimetable");
          const routeId = getCourseRouteId(course);
          const db = getDatabaseInstance();
          const { Q } = await import("@nozbe/watermelondb");
          const recs = await db.get("courses").query(Q.where("courseId", routeId)).fetch();
          if (recs.length > 0) {
            const { safeWrite } = await import("@/database/utils/safeTransaction");
            await safeWrite(db, async () => {
              await (recs[0] as any).update((m: any) => {
                m.contentRaw = JSON.stringify(fresh);
              });
            }, 10000, "save_course_resources");
          }
        } catch {
          // best-effort cache only
        }
      }
      return fresh;
    } catch (e) {
      error(String(e), "Pronote.getCourseResources");
      return Array.isArray(course.content) ? course.content : [];
    }
  }

  async getWeekContents(from: Date, to: Date): Promise<WeekLessonContent[]> {
    await this.checkTokenValidty();
    return fetchPronoteWeekContents(
      this.getAuthToken(),
      this.accountId,
      from,
      to,
      this.getSelectedChildName()
    );
  }

  async getChats(onlyUnread?: boolean): Promise<Chat[]> {
    await this.checkTokenValidty();
    return fetchPronoteChats(
      this.getAuthToken(),
      this.accountId,
      this.getSelectedChildName(),
      onlyUnread ? true : undefined
    );
  }

  async getChatRecipients(chat: Chat): Promise<Recipient[]> {
    await this.checkTokenValidty();
    return fetchPronoteChatRecipients(
      this.getAuthToken(),
      chat,
      this.getSelectedChildName()
    );
  }

  async getChatMessages(chat: Chat): Promise<Message[]> {
    await this.checkTokenValidty();
    return fetchPronoteChatMessages(
      this.getAuthToken(),
      this.accountId,
      chat,
      this.getSelectedChildName()
    );
  }

  async getRecipientsAvailableForNewChat(): Promise<Recipient[]> {
    await this.checkTokenValidty();
    return fetchPronoteRecipients(
      this.getAuthToken(),
      this.getSelectedChildName()
    );
  }

  async sendMessageInChat(chat: Chat, content: string, messageId?: string): Promise<void> {
    await this.checkTokenValidty();
    await sendPronoteMessageInChat(
      this.getAuthToken(),
      chat,
      content,
      this.getSelectedChildName(),
      messageId
    );
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    await this.checkTokenValidty();
    return setPronoteNewsAsAcknowledged(
      this.getAuthToken(),
      news,
      this.getSelectedChildName()
    );
  }

  async setHomeworkCompletion(
    homework: Homework,
    state?: boolean
  ): Promise<Homework> {
    await this.checkTokenValidty();
    // Espace parent : le devoir porte son kidName ; le selectedChild global
    // peut être stale après un switch d'enfant → préférer le kid de l'item.
    const childName =
      (homework as { kidName?: unknown }).kidName && typeof (homework as { kidName?: unknown }).kidName === "string" && ((homework as { kidName?: string }).kidName as string).length > 0
        ? ((homework as { kidName?: string }).kidName as string)
        : this.getSelectedChildName();
    return setPronoteHomeworkAsDone(
      this.getAuthToken(),
      homework,
      state,
      childName
    );
  }

  async createMail(
    subject: string,
    content: string,
    recipients: Recipient[]
  ): Promise<Chat> {
    await this.checkTokenValidty();
    return createPronoteMail(
      this.getAuthToken(),
      this.accountId,
      subject,
      content,
      recipients,
      this.getSelectedChildName()
    );
  }
}
