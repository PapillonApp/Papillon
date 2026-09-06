import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import { useScreenOptions } from '@/utils/theme/ScreenOptions';

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const androidHeaderProps = useAndroidHeaderProps();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ ...androidHeaderProps }} />
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
