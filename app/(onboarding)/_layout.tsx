import React from 'react';
import { View } from 'react-native';

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
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ ...newScreenOptions, title: "" }}
        />
        <Stack.Screen
          name="ageSelection"
          options={{ ...newScreenOptions, title: "À propos de toi" }}
        />
        <Stack.Screen
          name="serviceSelection"
          options={{ ...newScreenOptions, title: "Service scolaire" }}
        />
      </Stack>
    </View>
  );
}