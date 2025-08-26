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
        name="cards"
        options={{
          headerShown: true,
          headerTitle: "Cartes",
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTransparent: true,
          presentation: "modal",
        }}
        initialParams={{
          periods: [],
          currentPeriod: {},
          attendances: []
        }}
      />
    </Stack>
  );
}