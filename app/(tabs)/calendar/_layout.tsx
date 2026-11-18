import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAndroidHeaderProps } from "@/components/AndroidHeaderBackground";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { useScreenOptions } from "@/utils/theme/ScreenOptions";

import CalendarHeaderBackground from "./components/CalendarHeaderBackground";

// eslint-disable-next-line camelcase
export const unstable_settings = {
  anchor: "index",
};

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const androidHeaderProps = useAndroidHeaderProps();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          ...androidHeaderProps,
          // The custom title on this screen suppresses the bar's own scroll-edge
          // material, so iOS 26 gets our progressive blur instead. Everywhere
          // else the header keeps a plain opaque background.
          ...(runsIOS26
            ? { headerTransparent: true, headerBackground: () => <CalendarHeaderBackground /> }
            : { headerTransparent: false }),
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
          ...androidHeaderProps,
        }}
      />
    </Stack>
  );
}
