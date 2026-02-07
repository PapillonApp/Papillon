import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { User } from "appscho";
import { refreshAppSchoAccount } from "./refresh";
import { error, log } from "@/utils/logger/logger";
import { CourseDay } from "@/services/shared/timetable";
import { fetchAppschoTimetable } from "@/services/appscho/timetable";
import { News } from "@/services/shared/news";
import { fetchAppschoNews } from "@/services/appscho/news";
import { useAccountStore } from "@/stores/account";

export class Appscho implements SchoolServicePlugin {
  displayName = "AppScho";
  service = Services.APPSCHO;
  capabilities: Capabilities[] = [Capabilities.TIMETABLE, Capabilities.NEWS];
  session: User | undefined;
  authData: Auth = {};

  constructor(public accountId: string) {
    const account = useAccountStore.getState().accounts.find(a => a.id === accountId);
    const service = account?.services.find(s => s.serviceId === Services.APPSCHO);
    
    if (service?.auth) {
      this.authData = service.auth;
    }
  }

  private async requestWrapper<T>(requestFn: (session: User) => Promise<T>): Promise<T> {
    try {
      if (!this.session) {
        await this.refreshAccount(this.authData);
      }

      const result = await requestFn(this.session!);

      if (result && (result as any).state === "unauthorized") {
        throw new Error("AppScho: Unauthorized State");
      }

      return result;
    } catch (err: any) {
      const errorMessage = String(err.message || "");
      const isUnauthorized = 
        errorMessage.includes("401") || 
        errorMessage.includes("Unauthorized") || 
        err?.state === "unauthorized";

      if (isUnauthorized) {     
        try {
          await this.refreshAccount(this.authData);
          
          const retryResult = await requestFn(this.session!);

          if (retryResult && (retryResult as any).state === "unauthorized") {
            throw new Error("Persistent Unauthorized State");
          }

          return retryResult;
        } catch (refreshErr) {
          error(`[Appscho] Failed to refresh the unauthorized state: ${refreshErr}`, "Appscho.requestWrapper");
          throw refreshErr;
        }
      }

      throw err;
    }
  }

  async refreshAccount(credentials: Auth): Promise<Appscho> {
    try {
      const credsToUse = credentials?.additionals?.instanceId ? credentials : this.authData;
      
      const refresh = await refreshAppSchoAccount(this.accountId, credsToUse);
      
      this.authData = refresh.auth;
      this.session = refresh.session;
      
      return this;
    } catch (refreshError) {
      error(`Failed to refresh AppScho account: ${refreshError}`, "Appscho.refreshAccount");
      throw refreshError;
    }
  }

  async getWeeklyTimetable(weekNumber: number, date: Date, forceRefresh?: boolean): Promise<CourseDay[]> {
    return this.requestWrapper(async (currentSession) => {
      const instanceId = String(this.authData.additionals?.["instanceId"]);
      return fetchAppschoTimetable(currentSession, this.accountId, weekNumber, instanceId, forceRefresh);
    });
  }

  async getNews(): Promise<News[]> {
    return this.requestWrapper(async (currentSession) => {
      const instanceId = String(this.authData.additionals?.["instanceId"]);
      return fetchAppschoNews(currentSession, this.accountId, instanceId);
    });
  }
}