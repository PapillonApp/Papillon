import React from 'react';
import { Platform, PlatformColor, View } from 'react-native';
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
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions, androidHeaderProps]);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="locate"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_LOCATION_SEARCH") }}
        />
        <Stack.Screen
          name="select"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_SCHOOLS") }}
        />
        <Stack.Screen
          name="url"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_SCHOOL_URL") }}
        />
        <Stack.Screen
          name="browser"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_ENT_LOGIN"), presentation: "modal", headerStyle: { backgroundColor: "transparent" } }}
        />
        <Stack.Screen
          name="qrcode"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_QRCODE_LOGIN") }}
        />
      </Stack>
    </View>
  );
}
