import { useTheme } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { Platform, StatusBar, View } from 'react-native';

import {
  ALERT_SCREEN_OPTIONS,
  CHANGELOG_SCREEN_OPTIONS,
  CONSENT_SCREEN_OPTIONS,
  DEMO_SCREEN_OPTIONS,
  DEVMODE_REQUESTS_SCREEN_OPTIONS,
  DEVMODE_SCREEN_OPTIONS,
  STACK_SCREEN_OPTIONS
} from '@/constants/LayoutScreenOptions';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { screenOptions } from '@/utils/theme/ScreenOptions';
import { useAndroidHeaderProps } from './AndroidHeaderBackground';
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';

function RootNavigatorContent() {
  const theme = useTheme();
  const androidHeaderProps = useAndroidHeaderProps();

  // Memoize combined screen options to prevent object recreation
  const stackScreenOptions = useMemo(() => ({
    ...screenOptions,
    ...STACK_SCREEN_OPTIONS,
    contentStyle: {
      backgroundColor: theme.colors.background
    }
  }), [theme]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          Platform.OS === "android" ? theme.colors.background : undefined,
      }}
    >
      {Platform.OS === "android" && (
        <StatusBar
          barStyle={theme.dark ? "light-content" : "dark-content"}
          animated
        />
      )}
      <Stack initialRouteName="(tabs)" screenOptions={stackScreenOptions}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(new)"
          options={{ headerShown: false, presentation: "formSheet" }}
        />
        <Stack.Screen
          name="(settings)"
          options={{ headerShown: false, presentation: "formSheet" }}
        />
        <Stack.Screen name="demo" options={DEMO_SCREEN_OPTIONS} />
        <Stack.Screen name="consent" options={CONSENT_SCREEN_OPTIONS} />
        <Stack.Screen name="changelog" options={CHANGELOG_SCREEN_OPTIONS} />
        <Stack.Screen name="devmode" options={DEVMODE_SCREEN_OPTIONS} />
        <Stack.Screen
          name="(dev)/requests"
          options={DEVMODE_REQUESTS_SCREEN_OPTIONS}
        />
        <Stack.Screen
          name="(dev)/request"
          options={DEVMODE_REQUESTS_SCREEN_OPTIONS}
        />
        <Stack.Screen name="alert" options={ALERT_SCREEN_OPTIONS} />

        <Stack.Screen
          name="(modals)/wallpaper"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 1],
            headerLargeTitle: false,
            sheetLargestUndimmedDetentIndex: 0,
            headerTransparent: Platform.OS === "ios",
            headerTitle: t("Modal_Wallpaper_Title"),
            contentStyle: {
              backgroundColor: theme.colors.card,
            },
            ...androidHeaderProps,
          }}
        />

        <Stack.Screen
          name="(modals)/profile"
          options={{
            presentation: "formSheet",
            headerLargeTitle: false,
            headerTitle: t("Modal_Profile_Title"),
            ...androidHeaderProps,
          }}
        />
        <Stack.Screen
          name="(modals)/course/[id]"
          options={{
            headerTitle: t("Modal_Course_Title"),
            headerLargeTitle: false,
            headerTransparent: true,
            ...androidHeaderProps,
            contentStyle: {
              borderRadius: Platform.OS === "ios" ? 30 : 0,
              overflow: Platform.OS === "ios" ? "hidden" : "visible",
            },
          }}
        />
        <Stack.Screen
          name="(modals)/notifications"
          options={{
            headerShown: false,
            headerTitle: "Notifications",
            headerTransparent: runsIOS26,
            headerLargeTitle: false,
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 0.75, 1],
            sheetCornerRadius: runsIOS26 ? undefined : 30,
            contentStyle: {
              backgroundColor: runsIOS26 ? "transparent" : undefined,
            },
          }}
        />
        <Stack.Screen
          name="(modals)/welcome"
          options={{
            headerShown: false,
            headerTitle: "",
            headerLargeTitle: false,
            presentation: "modal",
            gestureEnabled: false,
            ...androidHeaderProps,
          }}
        />

        <Stack.Screen
          name="(features)/(news)/news"
          options={{
            headerShown: false,
            headerTitle: t("Tab_News"),
            headerTransparent: runsIOS26,
            headerLargeTitle: false,
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="(features)/(news)/specific"
          options={{
            headerShown: true,
            headerTitle: t("Tab_News"),
            headerTransparent: runsIOS26,
            headerLargeTitle: false,
          }}
        />

        <Stack.Screen
          name="(modals)/team"
          options={{
            headerShown: Platform.OS !== "ios",
            presentation: Platform.select({
              ios: "formSheet",
              default: "modal",
            }),
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            ...androidHeaderProps,
          }}
        />

        <Stack.Screen
          name="(features)/soon"
          options={{
            headerShown: Platform.OS !== "ios",
            presentation: Platform.select({
              ios: "formSheet",
              default: "modal",
            }),
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            headerTitle: t("Modal_Soon"),
            ...androidHeaderProps,
          }}
        />

        <Stack.Screen
          name="(features)/(cards)/cards"
          options={{
            headerShown: false,
            presentation: "modal",
            headerTitle: t("Profile_QRCards"),
            headerTransparent: runsIOS26,
          }}
        />

        <Stack.Screen
          name="(features)/(cards)/specific"
          options={{
            headerShown: false,
            presentation: "modal",
            headerTitle: t("Profile_QRCards"),
            headerTransparent: runsIOS26,
          }}
        />

        <Stack.Screen
          name="(features)/(cards)/qrcode"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            headerTitle: "QR-Code",
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="(features)/attendance"
          options={{
            headerShown: false,
            headerTitle: t("Tab_Attendance"),
            headerTransparent: runsIOS26,
            headerLargeTitle: true,
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

export function RootNavigator() {
  return (
    <MainTabErrorBoundary>
      <RootNavigatorContent />
    </MainTabErrorBoundary>
  );
}
