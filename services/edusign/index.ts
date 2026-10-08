import { Auth, Services } from "@/stores/account/types";
import { log, error } from "@/utils/logger/logger";

import { Attendance } from "../shared/attendance";
import { CourseDay } from "../shared/timetable";
import {
  AttendanceSignParams,
  Capabilities,
  SchoolServicePlugin,
} from "../shared/types";

import { fetchEdusignTimetable } from "./timetable";
import { fetchEdusignAttendance } from "./attendance";
import { refreshEdusignAccount } from "./refresh";
import { fetchEdusignNews } from "./news";
import { News } from "../shared/news";
import { Homework } from "../shared/homework";
import { fetchEdusignHomeworks } from "./homework";

import { Period } from "../shared/grade";
import { LinksignClient } from "@studentsphere/linksign";
import * as Device from "expo-device";
import { syncSignReminders } from "@/utils/notifications/signReminders";

export class Edusign implements SchoolServicePlugin {
  displayName = "Edusign";
  service = Services.EDUSIGN;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.TIMETABLE,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
    Capabilities.NEWS,
    Capabilities.HOMEWORK,
    Capabilities.SIGN,
  ];
  session: LinksignClient | undefined = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Edusign> {
    const refresh = await refreshEdusignAccount(this.accountId, credentials);
    this.authData = refresh.auth;
    this.session = refresh.session;
    return this;
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    if (this.session) {
      const days = await fetchEdusignTimetable(
        this.session,
        this.accountId,
        weekNumber
      );
      syncSignReminders(days.flatMap(day => day.courses));
      return days;
    }
    throw error(
      "Session or account is not valid",
      "Edusign.getWeeklyTimetable"
    );
  }

  async getAttendancePeriods(): Promise<Period[]> {
    const now = new Date();
    return [
      {
        name: "Année en cours",
        id: "current",
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 6, 0),
        createdByAccount: this.accountId,
      },
    ];
  }

  async getAttendanceForPeriod(periodId: string): Promise<Attendance> {
    if (this.session) {
      return fetchEdusignAttendance(this.session, this.accountId, periodId);
    }
    throw error(
      "Session or account is not valid",
      "Edusign.getAttendanceForPeriod"
    );
  }

  async getNews(): Promise<News[]> {
    if (this.session) {
      return fetchEdusignNews(this.session, this.accountId);
    }
    throw error("Session or account is not valid", "Edusign.getNews");
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    if (this.session) {
      return fetchEdusignHomeworks(this.session, this.accountId, weekNumber);
    }
    throw error("Session or account is not valid", "Edusign.getHomeworks");
  }

  async signAttendance(params: AttendanceSignParams): Promise<unknown> {
    if (!this.session) {
      throw error("Session or account is not valid", "Edusign.signAttendance");
    }

    const rawSignature = params.signature;
    const base64Data = rawSignature.includes("data:image")
      ? rawSignature
      : `data:image/png;base64,${rawSignature.includes("base64,") ? rawSignature.split("base64,")[1] : rawSignature}`;

    if (params.qrCodeData) {
      const rawQrCodeData = params.qrCodeData.trim();
      let qrCodeId = rawQrCodeData;
      try {
        if (qrCodeId.startsWith("http://") || qrCodeId.startsWith("https://")) {
          const url = new URL(qrCodeId);
          qrCodeId =
            url.searchParams.get("qrcodeid") ||
            url.searchParams.get("id") ||
            url.pathname.split("/").filter(Boolean).pop() ||
            qrCodeId;
        }
      } catch {}

      const body = {
        signature: base64Data,
        courseId: params.courseId || "",
        UUID: (this.session as any)?.deviceId || "",
        Model: Device.modelName || "Papillon",
      };

      const token = (this.session as any)?.token || "YOUR_TOKEN";
      const deviceId = (this.session as any)?.deviceId;
      const deviceIdLine = deviceId ? ` \\\n  -H 'x-device-id: ${deviceId}'` : "";
      console.log(`curl -X POST 'https://api.edusign.fr/student/courses/scanQRCode-v2' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  -H 'qrcodeid: ${qrCodeId}'${deviceIdLine} \\
  -d '${JSON.stringify(body)}'`);

      try {
        return await this.session.signByQRCode(qrCodeId, body);
      } catch (err: any) {
        console.log(`\n\n=== EDUSIGN QR CODE ERROR ===\nname: ${err?.name}\nmessage: ${err?.message}\nfull error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}\n====================================\n\n`);
        throw err;
      }
    }

    if (params.code) {
      let studentId = (this.session as any)?.options?.studentId || "";
      if (!studentId) {
        try {
          const profile = await this.session.getProfile();
          studentId = profile?.ID || "";
        } catch {}
      }

      const body = {
        studentId,
        base64Signature: base64Data,
      };

      const token = (this.session as any)?.token || "YOUR_TOKEN";
      const deviceIdHeader = (this.session as any)?.deviceId ? `-H 'x-device-id: ${(this.session as any)?.deviceId}' \\\n` : "";
      console.log(`\n\n=== EDUSIGN DEBUG CURL (CODE) ===\ncurl -X POST 'https://api.edusign.fr/student/courses/code/setStudentPresent/${encodeURIComponent(params.code.trim())}' \\\n  -H 'Authorization: Bearer ${token}' \\\n  -H 'Content-Type: application/json' \\\n  ${deviceIdHeader}  -d '${JSON.stringify(body)}'\n=================================\n\n`);

      return await this.session.signByCode(params.code.trim(), body);
    }

    throw error(
      "Neither qrCodeData nor code was provided",
      "Edusign.signAttendance"
    );
  }
}
