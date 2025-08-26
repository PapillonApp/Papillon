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
        name="cards"
        options={{
          headerShown: true,
          headerTitle: "Cartes",
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />

      <Stack.Screen
        name="services"
        options={{
          headerTitle: t("Settings_Services_Title"),
        }}
      />
    </Stack>
  );
}
