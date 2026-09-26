import React from 'react';

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';
import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const screenOptions = useScreenOptions();
  const androidHeaderProps = useAndroidHeaderProps();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    ...androidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions, androidHeaderProps]);

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
