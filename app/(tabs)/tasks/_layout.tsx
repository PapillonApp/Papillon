import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useAndroidHeaderProps } from "@/components/AndroidHeaderBackground";
import ProgressiveHeaderBackground from "@/components/ProgressiveHeaderBackground";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

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
            ? { headerTransparent: true, headerBackground: () => <ProgressiveHeaderBackground /> }
            : { headerTransparent: false }),
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
