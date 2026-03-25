import React from 'react';
import { useTranslation } from "react-i18next";

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function OnboardingLayout() {
  const { t } = useTranslation();
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
        name="credentials"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_HEADER_ED_LOGIN") }}
      />
    </Stack>
  );
}
