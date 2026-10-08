import React from 'react';
import { useTranslation } from "react-i18next";

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const androidHeaderProps = useAndroidHeaderProps();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    ...androidHeaderProps,
    headerBackVisible: true,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal" as const,
    headerLargeTitle: false,
  }), [screenOptions, androidHeaderProps]);

  return (
    <Stack>
      <Stack.Screen
        name="credentials"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_LOGIN_VIA", { service: "Edusign" }) }}
      />
      <Stack.Screen
        name="authenticate"
        options={{
          ...newScreenOptions,
          presentation: "modal",
          headerTitle: t("ONBOARDING_LOGIN_WITH_PASSWORD"),
        }}
      />
      <Stack.Screen
        name="methods"
        options={{
          ...newScreenOptions,
          headerTitle: t("ONBOARDING_OTHER_LOGIN_METHODS"),
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="sso"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SSO_TITLE") }}
      />
      <Stack.Screen
        name="whitelabel"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_SCHOOL_APP") }}
      />
      <Stack.Screen
        name="whitelabel-schools"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_HEADER_SCHOOLS") }}
      />
      <Stack.Screen
        name="whitelabel-login"
        options={{
          ...newScreenOptions,
          presentation: "modal",
          headerTitle: t("LOGIN_BTN"),
        }}
      />
      <Stack.Screen
        name="select-account"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_ACCOUNTS_TITLE") }}
      />
      <Stack.Screen
        name="browser"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}
