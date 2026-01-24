import { router } from 'expo-router';
import { instance } from 'pawnote';
import { useCallback, useEffect } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { AuthenticationError } from '@/services/errors/AuthenticationError';
import { getManager, initializeAccountManager } from "@/services/shared";
import { Grade, Period } from '@/services/shared/grade';
import { Services } from '@/stores/account/types';
import { useSettingsStore } from '@/stores/settings';
import { useAlert } from '@/ui/components/AlertProvider';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { log, warn } from '@/utils/logger/logger';

export const useHomeData = () => {
  const alert = useAlert();
  const settingsstore = useSettingsStore(state => state.personalization);

  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    const date = new Date();
    const weekNumber = getWeekNumberFromDate(date);
    await manager.getWeeklyTimetable(weekNumber, date);
  }, []);

  const fetchGrades = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping grades fetch');
      return;
    }
    const gradePeriods = await manager.getGradesPeriods();
    const validPeriods: Period[] = [];
    const date = new Date().getTime();
    for (const period of gradePeriods) {
      if (period.start.getTime() > date && period.end.getTime() > date) {
        validPeriods.push(period);
      }
    }

    const grades: Grade[] = [];
    const currentPeriod = getCurrentPeriod(validPeriods);

    if (currentPeriod) {
      const periodGrades = await manager.getGradesForPeriod(currentPeriod, currentPeriod.createdByAccount);
      periodGrades.subjects.forEach(subject => {
        subject.grades.forEach(grade => {
          grades.push(grade);
        });
      });
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      await initializeAccountManager();
      log("Refreshed Manager received");

      await Promise.all([fetchEDT(), fetchGrades()]);

      if (settingsstore.showAlertAtLogin) {
        alert.showAlert({
          title: "Synchronisation réussie",
          description: "Toutes vos données ont été mises à jour avec succès.",
          icon: "CheckCircle",
          color: "#00C851",
          withoutNavbar: true,
          delay: 1000
        });
      }

    } catch (error) {
      if (String(error).includes("Unable to find")) { return; }
      if (error instanceof AuthenticationError) {
        const instanceURL = error?.service?.auth?.additionals?.["instanceURL"] ?? "";
        const serviceId = error?.service?.id ?? undefined;

        alert.showAlert({
          title: "Connexion impossible",
          description: "Il semblerait que ta session a expiré. Tu pourras renouveler ta session dans les paramètres en liant à nouveau ton compte.",
          icon: "TriangleAlert",
          color: "#D60046",
          customButton: instanceURL ? {
            label: "Me reconnecter",
            showCancelButton: error.service.serviceId === Services.PRONOTE,
            onPress: async () => {
              const authUrl = instanceURL;
              const instanceInfo = await instance(authUrl as string);

              if (instanceInfo && instanceInfo.casToken && instanceInfo.casURL) {
                return setTimeout(() => {
                  router.push({ pathname: "/(onboarding)/pronote/webview", params: { url: authUrl, serviceId } })
                }, 200)
              }

              setTimeout(() => {
                router.push({ pathname: "/(onboarding)/pronote/credentials", params: { url: authUrl, serviceId } })
              }, 200)
            }
          } : undefined,
          technical: error.message
        })
      }
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin]);

  useEffect(() => {
    initialize();
  }, [initialize]);
};
