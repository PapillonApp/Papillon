import React from 'react';
import { useTranslation } from "react-i18next";

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from 'react-native';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerBackVisible: Platform.select({ android: false, default: true }),
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
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SERVICE_TURBOSELF") }}
      />
      <Stack.Screen
        name="turboselfHost"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SERVICE_TURBOSELF") }}
      />
      <Stack.Screen
        name="ard"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SERVICE_ARD") }}
      />
      <Stack.Screen
        name="alise"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SERVICE_ALISE") }}
      />
      <Stack.Screen
        name="izly"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SERVICE_IZLY") }}
      />
    </Stack>
  );
}
