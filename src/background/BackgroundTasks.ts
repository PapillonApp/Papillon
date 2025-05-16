import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { isExpoGo } from "@/utils/native/expoGoAlert";

import { fetchNews } from "./data/News";
import { log, error, warn, info } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
import { fetchLessons } from "./data/Lessons";
import { fetchAttendance } from "./data/Attendance";
import { fetchEvaluation } from "./data/Evaluation";
import { papillonNotify } from "./Notifications";
import { useFlagsStore } from "@/stores/flags";

let isBackgroundFetchRunning = false;
const BACKGROUND_TASK_NAME = "background-fetch";

const fetch = async (label: string, fn: () => Promise<any>) => {
  try {
    info(`▶️ Running background ${label}`, "BACKGROUND");
    await fn();
  } catch (e) {
    error(`❌ ${label} fetch failed: ${e}`, "BACKGROUND");
  }
};

const backgroundFetch = async () => {
  const disableBackgroundTasks = useFlagsStore.getState().defined("disablebackgroundtasks");
  if (disableBackgroundTasks) {
    warn("⚠️ Background fetch disabled by flags.", "BACKGROUND");
    return BackgroundFetchResult.NoData;
  }

  const notifee = (await import("@notifee/react-native")).default;

  if (isBackgroundFetchRunning) {
    warn("⚠️ Background fetch already running. Skipping...", "BACKGROUND");
    return BackgroundFetchResult.NoData;
  }

  isBackgroundFetchRunning = true;

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        body: "Récupération des données des comptes les plus récentes en arrière-plan...",
        android: {
          progress: {
            indeterminate: true,
          },
        },
      },
      "Status"
    );
  }

  try {
    const accounts = getAccounts();
    const switchTo = getSwitchToFunction();

    const primaryAccounts = accounts.filter((account) => !account.isExternal);

    for (const account of primaryAccounts) {
      await switchTo(account);
      const notificationsTypesPermissions =
        account.personalization.notifications;

      if (notificationsTypesPermissions?.enabled) {
        await fetch("News", fetchNews);
        await fetch("Homeworks", fetchHomeworks);
        await fetch("Grades", fetchGrade);
        await fetch("Lessons", fetchLessons);
        await fetch("Attendance", fetchAttendance);
        await fetch("Evaluation", fetchEvaluation);
      }
    }

    log("✅ Finish background fetch", "BACKGROUND");
    return BackgroundFetchResult.NewData;
  } catch (ERRfatal) {
    error(`❌ Task failed: ${ERRfatal}`, "BACKGROUND");
    return BackgroundFetchResult.Failed;
  } finally {
    isBackgroundFetchRunning = false;
    if (__DEV__) {
      notifee.cancelNotification("statusBackground");
    }
  }
};

if (!isExpoGo()) TaskManager.defineTask(BACKGROUND_TASK_NAME, backgroundFetch);

const unsetBackgroundFetch = async () =>
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);

const setBackgroundFetch = async () =>
  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 60 * (__DEV__ ? 1 : 15),
    stopOnTerminate: false,
    startOnBoot: true,
  });

const registerBackgroundTasks = async () => {
  const disableBackgroundTasks = useFlagsStore.getState().defined("disablebackgroundtasks");
  if (disableBackgroundTasks) {
    warn("⚠️ Background tasks registration skipped because disabled by flag.", "BACKGROUND");
    await unsetBackgroundFetch()
      .then(() => log("✅ Background task unregistered (flag)", "BACKGROUND"))
      .catch((ERRfatal) =>
        error(`❌ Failed to unregister background task (flag): ${ERRfatal}`, "BACKGROUND")
      );
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_NAME
  );

  if (isRegistered) {
    info(
      "⚠️ Background task already registered. Unregister background task...",
      "BACKGROUND"
    );
    await unsetBackgroundFetch()
      .then(() => log("✅ Background task unregistered", "BACKGROUND"))
      .catch((ERRfatal) =>
        error(
          `❌ Failed to unregister background task: ${ERRfatal}`,
          "BACKGROUND"
        )
      );
  }

  await setBackgroundFetch()
    .then(() => log("✅ Background task registered", "BACKGROUND"))
    .catch((ERRfatal) =>
      error(
        `❌ Failed to register background task: ${ERRfatal}`,
        "BACKGROUND"
      )
    );
};

export { registerBackgroundTasks, unsetBackgroundFetch };