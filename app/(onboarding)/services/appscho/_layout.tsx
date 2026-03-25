import React from 'react';

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    headerBackVisible: true,
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