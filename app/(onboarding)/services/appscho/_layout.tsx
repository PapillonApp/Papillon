import React from 'react';

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';
import { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const screenOptions = useScreenOptions();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions]);

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
