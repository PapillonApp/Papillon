import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { Stack } from "expo-router";

import { screenOptions } from "@/utils/theme/ScreenOptions";
import AndroidHeaderBackground, { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import { t } from 'i18next';

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === "ios" ? "black" : undefined }}>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ ...newScreenOptions, title: "", headerLeft: () => null, headerShown: false, headerBackground: null }}
        />
        <Stack.Screen
          name="ageSelection"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_ABOUTYOU") }}
        />
        <Stack.Screen
          name="serviceSelection"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_SCHOOLSERVICE") }}
        />
        <Stack.Screen
          name="restaurants"
          options={{ headerShown: false, title: t("ONBOARDING_RESTAURANTS") }}
        />

        <Stack.Screen
          name="services/pronote"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/ed"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/skolengo"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/lannion"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/multi"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/appscho"
          options={{ headerShown: false, title: "" }}
        />
      </Stack>
    </View>
  );
}
