import React from 'react';
import { View } from 'react-native';
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
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_ENT_LOGIN"), presentation: "modal" }}
        />
        <Stack.Screen
          name="qrcode"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_QRCODE_LOGIN") }}
        />
      </Stack>
    </View>
  );
}
