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
          headerTitle: t("Tab_Calendar"),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: Platform.OS !== "ios",
          headerTitle: t("Modal_Course_Title"),
          headerLargeTitle: false,
          headerTransparent: true,
          presentation: Platform.OS !== "ios" ? "modal" : "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1],
          headerBackground: AndroidHeaderBackground,
          contentStyle: {
            borderRadius: Platform.OS === "ios" ? 30 : 0,
            overflow: Platform.OS === "ios" ? "hidden" : "visible",
          },
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          headerShown: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="icals"
        options={{
          presentation: "modal",
          headerLargeTitle: false,
          headerTitle: t("Tab_Calendar_Icals"),
          headerBackground: AndroidHeaderBackground
        }}
      />
    </Stack>
  );
}
