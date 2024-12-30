import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import Constants from "expo-constants";
import Preferences from "react-native-shared-group-preferences";
import { BackgroundFetchResult } from "expo-background-fetch";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import { fetchNews } from "./data/News";
import { PrimaryAccount } from "@/stores/account/types";
import { reloadAllTimelines } from "react-native-widgetkit";
import { useAccounts, useCurrentAccount } from "@/stores/account";

import { fetchLessons } from "./data/Lessons";


/**
 * Background fetch function that fetches all the data
 * @warning This task should not last more than 30 seconds
 * @returns BackgroundFetchResult.NewData
 */
const backgroundFetch = async () => {
  console.log("[background fetch] Running background fetch");
  const appGroupIdentifier = `group.${Constants.expoConfig?.ios?.bundleIdentifier}`;
  const news = [];
  const lessons = [];

  try {
    const accounts = useAccounts.getState().accounts.filter((account) => account.isExternal === false);
    const switchTo = (account: PrimaryAccount) => useCurrentAccount.getState().switchTo(account);

    // Fetch for each account
    for (const account of accounts) {
      try {
        await switchTo(account);
        const actualAccount = useCurrentAccount.getState().account;

        const fetchedNews = await fetchNews(actualAccount!);
        const fetchedLessons = await fetchLessons(actualAccount!);
        news.push(...fetchedNews);
        lessons.push(...fetchedLessons);
      }
      catch (error) {
        console.error("[background fetch] Error while fetching data for account", account, error);
      }
    }

    await Preferences.setItem("accounts", JSON.stringify(accounts.map(({name, schoolName, localID}) => ({name, schoolName, localID}))), appGroupIdentifier);
    console.log("[background fetch] Accounts fetched and saved in shared preferences");
    await Preferences.setItem("news", JSON.stringify(news), appGroupIdentifier);
    console.log("[background fetch] News fetched and saved in shared preferences");
    await Preferences.setItem("timetable", JSON.stringify(lessons), appGroupIdentifier);
    console.log("[background fetch] Lessons fetched and saved in shared preferences", await Preferences.getItem("timetable", appGroupIdentifier));

    // Reload all the timelines for iOS widgets
    await reloadAllTimelines();

    return BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("[background fetch] Error while fetching data", error);
    return BackgroundFetchResult.Failed;
  }
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
