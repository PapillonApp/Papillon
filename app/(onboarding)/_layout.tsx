import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Stack, useRouter } from "expo-router";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";
import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import { t } from 'i18next';
import Typography from '@/ui/new/Typography';

export default function OnboardingLayout() {
  const router = useRouter();
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
    <View style={{ flex: 1, backgroundColor: Platform.OS === "ios" ? "black" : undefined }}>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ ...newScreenOptions, title: "", headerLeft: () => null, headerShown: false }}
        />
        <Stack.Screen
          name="ageSelection"
          options={{
            ...newScreenOptions,
            title: t("ONBOARDING_HEADER_ABOUTYOU"),
            headerRight: 1==1
              ? () => (
                  <Pressable
                    hitSlop={12}
                    onPress={() => router.push("/(onboarding)/offlineAccount")}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Typography variant="action">
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
          options={{ headerShown: false, title: "", presentation: "formSheet" }}
        />
        <Stack.Screen
          name="services/ed"
          options={{ headerShown: false, title: "", presentation: "formSheet" }}
        />
        <Stack.Screen
          name="services/skolengo"
          options={{ headerShown: false, title: "", presentation: "formSheet" }}
        />
        <Stack.Screen
          name="services/multi"
          options={{ headerShown: false, title: "", presentation: "formSheet" }}
        />
        <Stack.Screen
          name="services/appscho"
          options={{ headerShown: false, title: "" }}
        />
      </Stack>
    </View>
  );
}
