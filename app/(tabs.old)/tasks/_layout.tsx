import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import AndroidHeaderBackground from "@/components/AndroidHeaderBackground";
import { Platform } from "react-native";

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitle: t("Tab_Tasks"),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: Platform.OS !== "ios",
          headerTitle: t("Modal_Task_Title"),
          headerTransparent: true,
          headerLargeTitle: false,
          presentation: Platform.OS !== "ios" ? "modal" : "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1],
          headerBackground: AndroidHeaderBackground,
        }}
      />
    </Stack>
  );
}
