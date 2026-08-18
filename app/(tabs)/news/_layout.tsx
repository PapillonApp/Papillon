import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import AndroidHeaderBackground from "@/components/AndroidHeaderBackground";

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitle: t("Tab_News"),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: "",
          headerLargeTitle: false,
          presentation: "modal",
          headerBackground: AndroidHeaderBackground,
        }}
      />
    </Stack>
  );
}
