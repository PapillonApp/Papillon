import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useAndroidHeaderProps } from "@/components/AndroidHeaderBackground";
import { Platform } from "react-native";

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const androidHeaderProps = useAndroidHeaderProps();

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
          headerTitle: t("Modal_Task_Title"),
          headerTransparent: true,
          headerLargeTitle: false,
          ...androidHeaderProps,
        }}
      />
    </Stack>
  );
}
