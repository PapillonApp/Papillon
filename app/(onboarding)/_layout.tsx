import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Stack, useRouter } from "expo-router";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { AndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import { t } from 'i18next';
import Typography from '@/ui/new/Typography';

export default function OnboardingLayout() {
  const router = useRouter();
  const screenOptions = useScreenOptions();
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    ...AndroidHeaderProps,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), [screenOptions]);

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === "ios" ? "black" : undefined }}>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ ...newScreenOptions, title: "", headerLeft: () => null, headerShown: false, headerBackground: null }}
        />
        <Stack.Screen
          name="ageSelection"
          options={{
            ...newScreenOptions,
            title: t("ONBOARDING_HEADER_ABOUTYOU"),
            headerRight: __DEV__
              ? () => (
                  <Pressable
                    hitSlop={12}
                    onPress={() => router.push("/(onboarding)/offlineAccount")}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Typography variant="action" color="primary">
                      {t("ONBOARDING_SKIP")}
                    </Typography>
                  </Pressable>
                )
              : undefined,
          }}
        />
        <Stack.Screen
          name="offlineAccount"
          options={{ ...newScreenOptions, title: t("ONBOARDING_OFFLINE_HEADER") }}
        />
        <Stack.Screen
          name="serviceSelection"
          options={{ ...newScreenOptions, title: t("ONBOARDING_HEADER_SCHOOLSERVICE") }}
        />
        <Stack.Screen
          name="restaurants"
          options={{ headerShown: false, title: t("ONBOARDING_RESTAURANTS") }}
        />

        <Stack.Screen
          name="services/pronote"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/ed"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/skolengo"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/multi"
          options={{ headerShown: false, title: "", presentation: "modal" }}
        />
        <Stack.Screen
          name="services/appscho"
          options={{ headerShown: false, title: "" }}
        />
      </Stack>
    </View>
  );
}
