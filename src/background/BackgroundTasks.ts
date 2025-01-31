import notifee, { EventType } from "@notifee/react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { isExpoGo } from "@/utils/native/expoGoAlert";

import { fetchNews } from "./data/News";
import { log, error, warn, info } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
// import { fetchLessons } from "./data/Lessons";
import { fetchAttendance } from "./data/Attendance";
import { fetchEvaluation } from "./data/Evaluation";
import { papillonNotify } from "./Notifications";

// Gestion des notifs quand app en arrière-plan
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  switch (type) {
    case EventType.ACTION_PRESS:
      console.log(`[Notifee] Action press: ${pressAction?.id}`);
      /*
      Ici on va gérer les redirections vers une page de l'app
      par exemple quand on clique sur une notification

      if (pressAction?.id === "open_lessons") {
        console.log("Open lessons screen");
      }
      */
      break;

    case EventType.DISMISSED:
      let badgeCount = await notifee.getBadgeCount();
      badgeCount--;
      await notifee.setBadgeCount(badgeCount);
      break;
  }
});

let isBackgroundFetchRunning = false;

const backgroundFetch = async () => {
  if (isBackgroundFetchRunning) {
    warn("⚠️ Background fetch already running. Skipping...", "BackgroundEvent");
    return BackgroundFetchResult.NoData;
  }

  isBackgroundFetchRunning = true;
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

  try {
    const accounts = getAccounts();
    const switchTo = getSwitchToFunction();

    for (const account of accounts) {
      await switchTo(account);
      const notificationsTypesPermissions =
        account.personalization.notifications;

      if (notificationsTypesPermissions?.enabled) {
        info("▶️ Running background News", "BackgroundEvent");
        await fetchNews();
        info("▶️ Running background Homeworks", "BackgroundEvent");
        await fetchHomeworks();
        info("▶️ Running background Grades", "BackgroundEvent");
        await fetchGrade();
        /* Disabled for now
        info("▶️ Running background Lessons", "BackgroundEvent");
        await fetchLessons();
        */
        info("▶️ Running background Attendance", "BackgroundEvent");
        await fetchAttendance();
        info("▶️ Running background Evaluation", "BackgroundEvent");
        await fetchEvaluation();
      }
    }

    log("✅ Finish background fetch", "BackgroundEvent");
    return BackgroundFetchResult.NewData;
  } catch (ERRfatal) {
    error(`❌ Task failed: ${ERRfatal}`, "BackgroundEvent");
    return BackgroundFetchResult.Failed;
  } finally {
    isBackgroundFetchRunning = false;
    notifee.cancelNotification("statusBackground");
  }
};

if (!isExpoGo()) {
  TaskManager.defineTask("background-fetch", backgroundFetch);
}

const unsetBackgroundFetch = async () => {
  await BackgroundFetch.unregisterTaskAsync("background-fetch");
  log("✅ Background task unregistered", "BackgroundEvent");
};

const registerBackgroundTasks = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    "background-fetch"
  );

  if (isRegistered) {
    /* warn(
      "⚠️ Background task already registered. Unregister background task...",
      "BackgroundEvent"
    );
    await unsetBackgroundFetch();
    */
    warn(
      "⚠️ Background task already registered. Erasing previous background task...",
      "BackgroundEvent"
    );
  }

  try {
    await BackgroundFetch.registerTaskAsync("background-fetch", {
      minimumInterval: 60 * 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    log("✅ Background task registered", "BackgroundEvent");
  } catch (err) {
    error(`❌ Failed to register background task: ${err}`, "BackgroundEvent");
  }
};

export { registerBackgroundTasks, unsetBackgroundFetch };
