import Router from "@/router";
import { useFonts } from "expo-font";
import { btoaPolyfill, atobPolyfill } from "js-base64";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import React, { useEffect } from "react";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function App () {
  const [fontsLoaded, fontError] = useFonts({
    light: require("./assets/fonts/FixelText-Light.ttf"),
    regular: require("./assets/fonts/FixelText-Regular.ttf"),
    medium: require("./assets/fonts/FixelText-Medium.ttf"),
    semibold: require("./assets/fonts/FixelText-SemiBold.ttf"),
    bold: require("./assets/fonts/FixelText-Bold.ttf"),
  });

  const applyGlobalPolyfills = () => {
    const encoding = require("text-encoding");
    Object.assign(global, {
      TextDecoder: encoding.TextDecoder,
      TextEncoder: encoding.TextEncoder,
      atob: atobPolyfill,
      btoa: btoaPolyfill
    });
  };

  applyGlobalPolyfills();

  useEffect(() => {
    LogBox.ignoreLogs([
      "[react-native-gesture-handler]",
      "VirtualizedLists should never be nested",
      "TNodeChildrenRenderer: Support for defaultProps"
    ]);

    // Register background tasks only if not running in the Expo Go app
    expoGoWrapper(async () => {
      const { registerBackgroundTasks } = await import("@/background/BackgroundTasks");
      registerBackgroundTasks();
    });
  }, []);

  if (!fontsLoaded && !fontError) return null;
  return <Router />;
}
