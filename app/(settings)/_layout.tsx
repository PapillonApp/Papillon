import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
  const { t } = useTranslation();

  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerLargeTitle: false,
    headerTransparent: runsIOS26,
    headerShadowVisible: false,
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
          headerBackButtonDisplayMode: "minimal",
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerTitle: t("Settings_About_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: Platform.OS === "ios",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="magic"
        options={{
          headerTitle: t("Settings_MagicPlus_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="subject_personalization"
        options={{
          headerTitle: t("Settings_SubjectPersonalization_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="tabs"
        options={{
          headerTitle: t("Settings_Tabs_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="edit_subject"
        options={{
          headerTitle: t("Settings_SubjectEdit_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerShown: false,
          presentation: "modal",
          contentStyle: {
            borderRadius: Platform.OS === 'ios' ? 30 : 0,
          }
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerTitle: t("Settings_Language_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
