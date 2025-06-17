import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Calendar"),
        }}
      />
      <Stack.Screen
        name="item"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Page"),
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Page"),
          presentation: "formSheet",
          sheetAllowedDetents: [0.25, 0.5, 0.9],
          sheetGrabberVisible: true,
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
