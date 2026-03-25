import React from 'react';

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerBackVisible: true,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), []);

  return (
    <Stack>
      <Stack.Screen
        name="locate"
        options={{ ...newScreenOptions, headerTitle: "Connexion via Skolengo" }}
      />
      <Stack.Screen
        name="webview"
        options={{ ...newScreenOptions, headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}