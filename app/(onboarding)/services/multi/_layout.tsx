import React from 'react';

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from "react-i18next";

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
  
  const param = useLocalSearchParams();

  return (
    <Stack>
      <Stack.Screen
        name="credentials"
        options={{ ...newScreenOptions, headerTitle: t("ONBOARDING_HEADER_UNIVERSITY_LOGIN"), params: param }}
      />
    </Stack>
  );
}
