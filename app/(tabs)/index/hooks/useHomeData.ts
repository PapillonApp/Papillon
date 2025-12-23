import { useCallback, useEffect } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { getManager, initializeAccountManager } from "@/services/shared";
import { Grade, Period } from '@/services/shared/grade';
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
      alert.showAlert({
        title: "Connexion impossible",
        description: "Il semblerait que ta session a expiré. Tu pourras renouveler ta session dans les paramètres en liant à nouveau ton compte.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error)
      });
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin]);

  useEffect(() => {
    initialize();
  }, [initialize]);
};
