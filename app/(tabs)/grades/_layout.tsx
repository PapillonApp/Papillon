import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import useResizable from "@/ui/utils/Resizable";

import AndroidHeaderBackground from '@/components/AndroidHeaderBackground';
import { useScreenOptions } from '@/utils/theme/ScreenOptions';

export default function Layout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const resize = useResizable();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: t('Modal_Grades_Title'),
          headerLargeTitle: false,
          headerTransparent: true,
          presentation: resize.isLarge ? 'formSheet' : 'card',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1],
          headerBackground: AndroidHeaderBackground,
        }}
      />
    </Stack>
  );
}
