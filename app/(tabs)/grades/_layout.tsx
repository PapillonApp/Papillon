import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitle: t("Tab_Grades"),
        }}
      />
      <Stack.Screen
        name="modals/SubjectInfo"
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTitle: t("Grades_SubjectInfo"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="modals/AboutAverages"
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTitle: t("Grades_Avg_KnowMore"),
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
