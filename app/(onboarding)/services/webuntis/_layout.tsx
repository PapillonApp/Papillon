import React from "react";
import { useTranslation } from "react-i18next";

import { Stack } from "expo-router";
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { AndroidHeaderProps } from "@/components/AndroidHeaderBackground";

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
        name="credentials"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_HEADER_WEBUNTIS_LOGIN") }}
      />
    </Stack>
  );
}
