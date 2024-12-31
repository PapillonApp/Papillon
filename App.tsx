import Router from "@/router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox, AppState, AppStateStatus, ActivityIndicator, View } from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
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

  const [fontsLoaded] = useFonts({
    light: require("./assets/fonts/FixelText-Light.ttf"),
    regular: require("./assets/fonts/FixelText-Regular.ttf"),
    medium: require("./assets/fonts/FixelText-Medium.ttf"),
    semibold: require("./assets/fonts/FixelText-SemiBold.ttf"),
    bold: require("./assets/fonts/FixelText-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch((error) => log(`Error hiding splash screen: ${error}`, "SplashScreen"));
    }
  }, [fontsLoaded]);

  const getBackgroundTimeLimit = useCallback((service: AccountService): number => {
    return BACKGROUND_LIMITS[service] ?? DEFAULT_BACKGROUND_TIME;
  }, []);

  const handleBackgroundState = useCallback(async () => {
    try {
      if (!backgroundStartTime.current) return;

      const timeInBackground = Date.now() - backgroundStartTime.current;
      backgroundStartTime.current = null;

      for (const account of accounts) {
        const timeLimit = getBackgroundTimeLimit(account.service);
        if (timeInBackground >= timeLimit) {
          await switchTo(account);
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
    if (!global.TextEncoder || !global.TextDecoder) {
      const encoding = require("text-encoding");
      Object.assign(global, {
        TextDecoder: encoding.TextDecoder,
        TextEncoder: encoding.TextEncoder,
        atob: atobPolyfill,
        btoa: btoaPolyfill,
      });
    }
  }, []);

  useEffect(() => {
    applyGlobalPolyfills();
  }, [applyGlobalPolyfills]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Router />;
}