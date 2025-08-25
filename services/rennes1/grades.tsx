import { Account, GradeKind, GradeValue, Session, studentGrades } from "pawdirecte";
import { Auth } from "@/stores/account/types";
import { generateId } from "@/utils/generateId";

import { AttachmentType } from "../shared/attachment";
import { GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";
import { loginBrowserService } from "@/layouts/providers/LoginBrowserService";

export async function fetchRennes1GradePeriods(authData: Auth, account: Account): Promise<Period[]> {
  return new Promise((resolve, reject) => {
    loginBrowserService.webViewRef.current.injectJavaScript(`
      (async () => {
        window.location.href = "https://notes9.iutlan.univ-rennes1.fr";
      })();
    `);

    loginBrowserService.subscribeToUrlChange((url) => {
      if (url.startsWith("https://notes9.iutlan.univ-rennes1.fr")) {
        loginBrowserService.webViewRef.current.injectJavaScript(`
      (async () => {
        fetch("https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=dataPremièreConnexion")
          .then(response => response.json())
          .then(data => {
            window.ReactNativeWebView.postMessage("gp:relev:"+JSON.stringify(data));
          });
      })();
    `);
      }
    });

    const periodStart = new Date();
    const periodEnd = new Date();

    periodStart.setMonth(periodStart.getMonth() - 6);
    periodEnd.setMonth(periodEnd.getMonth() + 6);

    loginBrowserService.subscribeToMessage((event) => {
      const data = event.nativeEvent.data;

      if (data.startsWith("gp:relev:")) {
        const jsonData = JSON.parse(data.substring("gp:relev:".length));
        if (jsonData && jsonData.semestres) {

          const periods = jsonData.semestres.map((period: any) => ({
            id: period.formsemestre_id,
            name: "Semestre " + period.semestre_id,
            start: periodStart,
            end: periodEnd,
            createdByAccount: account.id
          }));

          console.log("Done iutlan periods")
          resolve(periods);
        }
      }
    });
  });

}

export async function fetchRennes1Grades(authData: Auth, account: Account, period: Period): Promise<PeriodGrades> {
  console.log("Fetching grades for period:", period);

  return null;
}