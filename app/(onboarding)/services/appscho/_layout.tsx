import React from 'react';

import { Stack } from 'expo-router';
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';
import { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), []);

  return (
    <Stack>
      <Stack.Screen
        name="list"
        options={{ ...newScreenOptions }}
      />
      <Stack.Screen
        name="credentials"
        options={{ ...newScreenOptions }}
      />
      <Stack.Screen
        name="webview"
        options={{ ...newScreenOptions }}
      />
    </Stack>
  );
}