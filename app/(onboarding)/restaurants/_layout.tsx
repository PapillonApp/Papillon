import React from 'react';

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';

export default function OnboardingLayout() {
  const screenOptions = useScreenOptions();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerBackVisible: Platform.select({ android: false, default: true }),
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions]);

  return (
    <Stack>
      <Stack.Screen
        name="method"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="turboself"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="turboselfHost"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="ard"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="alise"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
      <Stack.Screen
        name="izly"
        options={{ ...newScreenOptions, headerTitle: "" }}
      />
    </Stack>
  );
}
