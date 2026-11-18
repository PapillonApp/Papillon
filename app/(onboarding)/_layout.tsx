import { Stack, useRouter } from "expo-router";
import { HeaderBackButton } from "expo-router/react-navigation";
import { t } from 'i18next';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { useAndroidHeaderProps } from '@/components/AndroidHeaderBackground';
import Typography from '@/ui/new/Typography';
import { useScreenOptions } from "@/utils/theme/ScreenOptions";

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

  const sheetPresentation = Platform.OS === "android" ? "card" : "formSheet";

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === "ios" ? "black" : undefined }}>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ ...newScreenOptions, title: "", headerLeft: () => null, headerShown: false }}
        />
        <Stack.Screen
          name="ageSelection"
          options={({ route }) => ({
            ...newScreenOptions,
            title: t("ONBOARDING_HEADER_ABOUTYOU"),
            ...((route.params as { action?: string } | undefined)?.action === "addService" && {
              unstable_headerLeftItems: () => [{
                type: "button" as const,
                label: "",
                icon: { type: "sfSymbol" as const, name: "chevron.left" as const },
                onPress: () => router.back(),
              }],
              headerLeft: ({ tintColor }: { tintColor?: string }) => (
                <HeaderBackButton tintColor={tintColor} onPress={() => router.back()} />
              ),
            }),
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
          })}
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
          options={{ headerShown: false, title: "", presentation: sheetPresentation }}
        />
        <Stack.Screen
          name="services/ed"
          options={{ headerShown: false, title: "", presentation: sheetPresentation }}
        />
        <Stack.Screen
          name="services/skolengo"
          options={{ headerShown: false, title: "", presentation: sheetPresentation }}
        />
        <Stack.Screen
          name="services/multi"
          options={{ headerShown: false, title: "", presentation: sheetPresentation }}
        />
        <Stack.Screen
          name="services/appscho"
          options={{ headerShown: false, title: "" }}
        />
      </Stack>
    </View>
  );
}
