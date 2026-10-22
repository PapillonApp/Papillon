import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import { useScreenOptions } from '@/utils/theme/ScreenOptions';
import ProgressiveHeaderBackground from '@/components/ProgressiveHeaderBackground';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

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
          // material, so iOS 26 gets our progressive blur instead.
          ...(runsIOS26
            ? { headerTransparent: true, headerBackground: () => <ProgressiveHeaderBackground /> }
            : { headerTransparent: false }),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: t('Modal_Grades_Title'),
          headerLargeTitle: false,
          headerTransparent: true,
          presentation: 'card',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [1],
          ...androidHeaderProps,
        }}
      />
    </Stack>
  );
}
