import React from 'react';
import { useTranslation } from "react-i18next";

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';
import { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), []);

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
