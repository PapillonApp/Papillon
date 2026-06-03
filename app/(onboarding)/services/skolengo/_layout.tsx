import React from 'react';
import { useTranslation } from "react-i18next";

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';
import { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions]);

  return (
    <Stack>
      <Stack.Screen
        name="locate"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_HEADER_SKOLENGO_LOGIN") }}
      />
      <Stack.Screen
        name="webview"
        options={{ ...newScreenOptions, headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}
