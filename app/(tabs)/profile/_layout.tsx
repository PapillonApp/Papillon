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
          headerTitle: t("Tab_Profile"),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="custom"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Custom_Profile"),
          headerLargeTitle: false,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}