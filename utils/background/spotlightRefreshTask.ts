import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { getWeekNumberFromDate } from "@/database/useHomework";
import { reindexSpotlight } from "@/modules/papillon-native/src";
import { AuthenticationError } from "@/services/errors/AuthenticationError";
import { ServiceUnavailableError } from "@/services/errors/ServiceUnavailableError";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { log, warn } from "@/utils/logger/logger";

export const SPOTLIGHT_REFRESH_TASK_NAME = "papillon-spotlight-refresh";

TaskManager.defineTask(SPOTLIGHT_REFRESH_TASK_NAME, async () => {
  const accountId = useAccountStore.getState().lastUsedAccount;
  if (!accountId) {
    return;
  }

  try {
    const manager = await initializeAccountManager(accountId);
    const now = new Date();
    const weekNumber = getWeekNumberFromDate(now);

    await manager.getWeeklyTimetable(weekNumber, now);
    await manager.getHomeworks(weekNumber);

    const periods = await manager.getGradesPeriods();
    const currentPeriod = getCurrentPeriod(periods);
    if (currentPeriod) {
      await manager.getGradesForPeriod(currentPeriod, currentPeriod.createdByAccount);
    }

    log("Spotlight background refresh: sync OK");
  } catch (e) {
    if (e instanceof AuthenticationError) {
      warn(`Spotlight background refresh: reconnexion nécessaire, sync ignorée (${e})`);
    } else if (e instanceof ServiceUnavailableError) {
      warn(`Spotlight background refresh: service indisponible, sync ignorée (${e})`);
    } else {
      warn(`Spotlight background refresh: erreur de sync inattendue (${e})`);
    }
  }

  try {
    await reindexSpotlight(accountId);
  } catch (e) {
    warn(`Spotlight background refresh: réindexation échouée (${e})`);
  }
});

export async function registerSpotlightRefreshTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(SPOTLIGHT_REFRESH_TASK_NAME);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(SPOTLIGHT_REFRESH_TASK_NAME);
  }
}
