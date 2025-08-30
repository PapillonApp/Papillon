import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
  const { t } = useTranslation();

  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerLargeTitle: runsIOS26(),
    headerBackVisible: true,
  }), []);

  return (
    <Stack screenOptions={newScreenOptions}>
      <Stack.Screen
        name="settings"
        options={{
          headerTitle: t("Tab_Settings"),
        }}
      />

      <Stack.Screen
        name="services"
        options={{
          headerTitle: t("Settings_Services_Title"),
          headerShown: true,
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="personalization"
        options={{
          headerTitle: t("Settings_Personalization_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLargeTitle: false,
        }}
      />

      <Stack.Screen
        name="cards"
        options={{
          headerShown: true,
          headerTitle: t("Settings_Cards_Title"),
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackButtonDisplayMode: "minimal",
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerTitle: t("Settings_About_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="magic"
        options={{
          headerTitle: t("Settings_MagicPlus_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="subject_personalization"
        options={{
          headerTitle: t("Settings_SubjectPersonalization_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
