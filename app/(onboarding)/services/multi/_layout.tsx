import React from 'react';

import { Stack } from 'expo-router';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from "react-i18next";
import { Platform } from 'react-native';
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
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions, androidHeaderProps]);
  
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
