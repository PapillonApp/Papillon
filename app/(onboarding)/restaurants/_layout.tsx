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
        name="method"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="turboself"
        options={{ ...newScreenOptions, headerTitle: "TurboSelf" }}
      />
      <Stack.Screen
        name="turboselfHost"
        options={{ ...newScreenOptions, headerTitle: "TurboSelf" }}
      />
      <Stack.Screen
        name="ard"
        options={{ ...newScreenOptions, headerTitle: "ARD" }}
      />
      <Stack.Screen
        name="alise"
        options={{ ...newScreenOptions, headerTitle: "Alise" }}
      />
      <Stack.Screen
        name="izly"
        options={{ ...newScreenOptions, headerTitle: "Izly" }}
      />
    </Stack>
  );
}