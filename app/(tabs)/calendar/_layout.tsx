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
          headerShown: false,
          headerTitle: t("Tab_Calendar"),
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
        }}
      />
    </Stack>
  );
}
