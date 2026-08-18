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

export interface SpotlightRefreshResult {
  accountId: string | null;
  syncOk: boolean;
  syncError: string | null;
  reindexOk: boolean;
  reindexError: string | null;
}

export async function runSpotlightRefresh(): Promise<SpotlightRefreshResult> {
  const accountId = useAccountStore.getState().lastUsedAccount;
  const result: SpotlightRefreshResult = {
    accountId: accountId || null,
    syncOk: false,
    syncError: null,
    reindexOk: false,
    reindexError: null,
  };

  if (!accountId) {
    return result;
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

    result.syncOk = true;
    log("Spotlight background refresh: sync OK");
  } catch (e) {
    result.syncError = String(e);
    if (e instanceof AuthenticationError) {
      warn(`Spotlight background refresh: reconnexion nécessaire, sync ignorée (${e})`);
    } else if (e instanceof ServiceUnavailableError) {
      warn(`Spotlight background refresh: service indisponible, sync ignorée (${e})`);
    } else {
      warn(`Spotlight background refresh: erreur de sync inattendue (${e})`);
    }
  }

  try {
    const account = useAccountStore.getState().accounts.find(a => a.id === accountId);
    await reindexSpotlight(account?.services.map(service => service.id) ?? [accountId]);
    result.reindexOk = true;
  } catch (e) {
    result.reindexError = String(e);
    warn(`Spotlight background refresh: réindexation échouée (${e})`);
  }

  return result;
}

TaskManager.defineTask(SPOTLIGHT_REFRESH_TASK_NAME, runSpotlightRefresh);

export async function registerSpotlightRefreshTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(SPOTLIGHT_REFRESH_TASK_NAME);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(SPOTLIGHT_REFRESH_TASK_NAME);
  }
}

export async function isSpotlightRefreshTaskRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(SPOTLIGHT_REFRESH_TASK_NAME);
}
