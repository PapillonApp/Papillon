import React from 'react';

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from "react-i18next";
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
