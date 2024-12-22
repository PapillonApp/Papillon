import Router from "@/router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox, AppState, AppStateStatus } from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import { atobPolyfill, btoaPolyfill } from "js-base64";

SplashScreen.preventAutoHideAsync();

const DEFAULT_BACKGROUND_TIME = 15 * 60 * 1000; // 15 minutes

const BACKGROUND_LIMITS: Partial<Record<AccountService, number>> = {
  [AccountService.EcoleDirecte]: 15 * 60 * 1000,    // 15 minutes
  [AccountService.Pronote]: 5 * 60 * 1000,         // 5 minutes
  [AccountService.Skolengo]: 12 * 60 * 60 * 1000,  // 12 heures
};

export default function App () {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const backgroundStartTime = useRef<number | null>(null);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const accounts = useAccounts((store) => store.accounts)
    .filter(account => !account.isExternal);

  const [fontsLoaded, fontError] = useFonts({
    light: require("./assets/fonts/FixelText-Light.ttf"),
    regular: require("./assets/fonts/FixelText-Regular.ttf"),
    medium: require("./assets/fonts/FixelText-Medium.ttf"),
    semibold: require("./assets/fonts/FixelText-SemiBold.ttf"),
    bold: require("./assets/fonts/FixelText-Bold.ttf"),
  });

  const getBackgroundTimeLimit = useCallback((service: AccountService): number => {
    return BACKGROUND_LIMITS[service] ?? DEFAULT_BACKGROUND_TIME;
  }, []);

  const handleBackgroundState = useCallback(async () => {
    try {
      if (!backgroundStartTime.current) return;

      const timeInBackground = Date.now() - backgroundStartTime.current;
      await AsyncStorage.setItem("@background_timestamp", Date.now().toString());

      for (const account of accounts) {
        const timeLimit = getBackgroundTimeLimit(account.service);
        const timeInBackgroundSeconds = Math.floor(timeInBackground / 1000);
        const serviceName = AccountService[account.service];

        log(`Checking account ${account.studentName.first} ${account.studentName.last}:`, "RefreshToken");
        log(`Time in background: ${timeInBackgroundSeconds}s`, "RefreshToken");
        log(`Time limit: ${timeLimit / 1000}s`, "RefreshToken");
        log(`Account type: ${serviceName}`, "RefreshToken");
        log(`Using ${BACKGROUND_LIMITS[account.service] ? "specific" : "default"} time limit`, "RefreshToken");

        if (timeInBackground >= timeLimit) {
          log(`⚠️ Refreshing account ${account.studentName.first} ${account.studentName.last} after ${timeInBackgroundSeconds}s in background`, "RefreshToken");

          // Prevent React state updates during render
          setTimeout(() => {
            switchTo(account).catch((error) => {
              log(`Error during switchTo: ${error}`, "RefreshToken");
            });
          }, 0);

          // Wait before processing next account
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      log(`Error handling background state: ${error}`, "RefreshToken");
    }
  }, [accounts, switchTo, getBackgroundTimeLimit]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      if (appState === nextAppState) return;

      if (nextAppState === "active") {
        log("🔄 App is active", "AppState");
        await handleBackgroundState();
        backgroundStartTime.current = null;
      } else if (nextAppState.match(/inactive|background/)) {
        log("App in background", "AppState");
        backgroundStartTime.current = Date.now();
      }

      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, [appState, handleBackgroundState]);

  useEffect(() => {
    LogBox.ignoreLogs([
      "[react-native-gesture-handler]",
      "VirtualizedLists should never be nested",
      "TNodeChildrenRenderer: Support for defaultProps"
    ]);

    expoGoWrapper(async () => {
      const { registerBackgroundTasks } = await import("@/background/BackgroundTasks");
      registerBackgroundTasks();
    });
  }, []);

  const applyGlobalPolyfills = useCallback(() => {
    const encoding = require("text-encoding");
    Object.assign(global, {
      TextDecoder: encoding.TextDecoder,
      TextEncoder: encoding.TextEncoder,
      atob: atobPolyfill,
      btoa: btoaPolyfill
    });
  }, []);

  useEffect(() => {
    applyGlobalPolyfills();
  }, [applyGlobalPolyfills]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Router />;
}