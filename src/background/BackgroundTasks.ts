import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import { useAccounts, useCurrentAccount } from "@/stores/account";

import { fetchNews } from "./data/News";

/**
 * Background fetch function that fetches all the data
 * @warning This task should not last more than 30 seconds
 * @returns BackgroundFetchResult.NewData
 */
const backgroundFetch = async () => {
  console.log("[background fetch] Running background fetch");

  const accounts = useAccounts((store) => store.accounts).filter(account => account.isExternal === false); // Get all accounts
  const switchTo = useCurrentAccount(store => store.switchTo); // Get the switchTo function

  for (const account of accounts) {
    await switchTo(account);
    await Promise.all([fetchNews()]);
  }
  return BackgroundFetchResult.NewData;
};

const registerBackgroundTasks = async () => {
  expoGoWrapper(async () => {
    TaskManager.defineTask("background-fetch", () => backgroundFetch());

    BackgroundFetch?.registerTaskAsync("background-fetch", {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });

    backgroundFetch();

    console.log("[background fetch] Registered background fetch");
  });
};

const unsetBackgroundFetch = async () => {
  BackgroundFetch.unregisterTaskAsync("background-fetch");
  console.log("[background fetch] Unregistered background fetch");
};

export {
  registerBackgroundTasks,
  unsetBackgroundFetch,
};
