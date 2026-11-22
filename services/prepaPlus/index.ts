import {
  Capabilities,
  type SchoolServicePlugin,
} from "@/services/shared/types";
import { type Auth, Services } from "@/stores/account/types";

import {
  getPrepaPlusPeriods,
  makePeriodGrades,
  parseOralGrades,
  parseWrittenGrades,
} from "./grades";
import { getPrepaPlusOrigin, loginPrepaPlus } from "./login";

export class PrepaPlus implements SchoolServicePlugin {
  displayName = "Prépa Plus";
  service = Services.PREPA_PLUS;
  capabilities = [Capabilities.REFRESH, Capabilities.GRADES];
  authData: Auth = {};
  session: string | undefined;
  private gradesRequest?: Promise<Grade[]>;
  private lastGrades?: { grades: Grade[]; fetchedAt: number };

  constructor(private readonly serviceId = "") {}

  async refreshAccount(auth: Auth) {
    const { baseUrl, username, password } = auth.additionals ?? {};
    if (
      typeof baseUrl !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      throw new Error("Prépa Plus credentials are incomplete.");
    }
    this.session = await loginPrepaPlus(baseUrl, username, password);
    this.authData = auth;
    this.lastGrades = undefined;
    return this;
  }

  private async fetchGradePages(retry = true): Promise<Grade[]> {
    const baseUrl = this.authData.additionals?.baseUrl;
    if (typeof baseUrl !== "string" || !this.session) {
      throw new Error("Prépa Plus sign-in is required.");
    }
    const origin = getPrepaPlusOrigin(baseUrl);
    const session = this.session;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const pages = await Promise.all(
        ["/devoirs/mes_notes", "/colles/mes_notes/"].map(path =>
          fetch(origin + path, {
            headers: { Cookie: `sessionid=${session}` },
            credentials: "omit",
            redirect: "manual",
            signal: controller.signal,
          })
        )
      );
      console.log("[PREPA-DIAG] grade page status", pages.map(page => page.status));
      const expired = pages.some(page => {
        const location = page.headers.get("location");
        if (!location) {
          return page.status === 401;
        }
        const target = new URL(location, origin);
        return (
          target.origin === origin &&
          target.pathname.replace(/\/$/, "") === "/account/login"
        );
      });
      if (retry && expired) {
        await this.refreshAccount(this.authData);
        return await this.fetchGradePages(false);
      }

      const parsed = await Promise.allSettled(
        pages.map(async (page, index) => {
          if (!page.ok) {
            throw new Error(`Prépa Plus grades returned HTTP ${page.status}.`);
          }
          const html = await page.text();
        const grades = index === 0
            ? parseWrittenGrades(html, this.serviceId)
            : parseOralGrades(html, new Date(), this.serviceId);
        console.log("[PREPA-DIAG] parsed grades", index, grades.length);
        return grades;
        })
      );
      if (parsed[0].status === "rejected" && parsed[1].status === "rejected") {
        throw parsed[0].reason;
      }
      return parsed.flatMap(result =>
        result.status === "fulfilled" ? result.value : []
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private loadGrades() {
    this.gradesRequest ??= this.fetchGradePages()
      .then(grades => {
        this.lastGrades = { grades, fetchedAt: Date.now() };
        return grades;
      })
      .finally(() => {
        this.gradesRequest = undefined;
      });
    return this.gradesRequest;
  }

  async getGradesPeriods() {
    return getPrepaPlusPeriods(await this.loadGrades(), this.serviceId);
  }

  async getGradesForPeriod(period: Period) {
    const grades =
      this.lastGrades && Date.now() - this.lastGrades.fetchedAt < 30_000
        ? this.lastGrades.grades
        : await this.loadGrades();
    return makePeriodGrades(
      grades.filter(
        grade =>
          grade.givenAt &&
          grade.givenAt >= period.start &&
          grade.givenAt < period.end
      ),
      this.serviceId
    );
  }
}
import { fetch } from "expo/fetch";

import type { Grade, Period } from "@/services/shared/grade";
