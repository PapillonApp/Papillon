import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { Platform, StatusBar, View } from 'react-native';

import {
  AI_SCREEN_OPTIONS,
  ALERT_SCREEN_OPTIONS,
  CHANGELOG_SCREEN_OPTIONS,
  CONSENT_SCREEN_OPTIONS,
  DEMO_SCREEN_OPTIONS,
  DEVMODE_SCREEN_OPTIONS,
  STACK_SCREEN_OPTIONS
} from '@/constants/LayoutScreenOptions';
import getCorners from '@/ui/utils/Corners';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { screenOptions } from '@/utils/theme/ScreenOptions';
import AndroidHeaderBackground from './AndroidHeaderBackground';

export function RootNavigator() {
  const theme = useTheme();
  const corners = getCorners();

  // Memoize combined screen options to prevent object recreation
  const stackScreenOptions = useMemo(() => ({
    ...screenOptions,
    ...STACK_SCREEN_OPTIONS,
    contentStyle: {
      backgroundColor: theme.colors.background
    }
  }), [theme]);

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === "android" ? theme.colors.background : undefined }}>
      {Platform.OS === "android" && <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} animated />}
      <Stack initialRouteName='(tabs)' screenOptions={stackScreenOptions}>

        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(new)" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="(settings)" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="page" />
        <Stack.Screen name="demo" options={DEMO_SCREEN_OPTIONS} />
        <Stack.Screen name="consent" options={CONSENT_SCREEN_OPTIONS} />
        <Stack.Screen name="changelog" options={CHANGELOG_SCREEN_OPTIONS} />
        <Stack.Screen name="ai" options={AI_SCREEN_OPTIONS} />
        <Stack.Screen name="devmode" options={DEVMODE_SCREEN_OPTIONS} />
        <Stack.Screen name="alert" options={ALERT_SCREEN_OPTIONS} />

        <Stack.Screen
          name="(modals)/wrapped"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "flip",
            contentStyle: {
              borderRadius: corners > 2 ? corners - 2 : 0,
              overflow: "hidden"
            }
          }}
        />

        <Stack.Screen
          name="(modals)/wallpaper"
          options={{
            presentation: "modal",
            headerLargeTitle: false,
            headerTitle: t("Modal_Wallpaper_Title"),
            contentStyle: {
              backgroundColor: theme.colors.card
            },
            headerBackground: AndroidHeaderBackground
          }}
        />

        <Stack.Screen
          name="(modals)/profile"
          options={{
            presentation: "modal",
            headerLargeTitle: false,
            headerTitle: t("Modal_Profile_Title"),
            headerBackground: AndroidHeaderBackground
          }}
        />
        <Stack.Screen
          name="(modals)/task"
          options={{
            headerShown: Platform.OS !== 'ios',
            headerTitle: t("Modal_Task_Title"),
            headerTransparent: true,
            headerLargeTitle: false,
            presentation: "modal",
            headerBackground: AndroidHeaderBackground
          }}
        />
        <Stack.Screen
          name="(modals)/grade"
          options={{
            headerShown: Platform.OS !== 'ios',
            headerTitle: t("Modal_Grades_Title"),
            headerLargeTitle: false,
            headerTransparent: true,
            presentation: "modal",
            headerBackground: AndroidHeaderBackground
          }}
        />
        <Stack.Screen
          name="(modals)/news"
          options={{
            headerShown: true,
            headerTitle: "",
            headerLargeTitle: false,
            presentation: "modal",
            headerBackground: AndroidHeaderBackground
          }}
        />
        <Stack.Screen
          name="(modals)/course"
          options={{
            headerShown: Platform.OS !== 'ios',
            headerTitle: t("Modal_Course_Title"),
            headerLargeTitle: false,
            headerTransparent: true,
            presentation: "modal",
            headerBackground: AndroidHeaderBackground,
            contentStyle: {
              borderRadius: Platform.OS === 'ios' ? 30 : 0,
              overflow: Platform.OS === 'ios' ? "hidden" : "visible",
            }
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
              backgroundColor: runsIOS26 ? 'transparent' : undefined
            }
          }}
        />

        <Stack.Screen
          name="(features)/(news)/news"
          options={{
            headerShown: true,
            headerTitle: t("Tab_News"),
            headerTransparent: runsIOS26,
            headerLargeTitle: false,
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
          name="(features)/soon"
          options={{
            headerShown: Platform.OS !== 'ios',
            presentation: Platform.select({
              ios: "formSheet",
              default: "modal"
            }),
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            headerTitle: t("Modal_Soon"),
            headerBackground: AndroidHeaderBackground
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
            animation: "fade"
          }}
        />

        <Stack.Screen
          name="(features)/attendance"
          options={{
            headerShown: true,
            headerTitle: t("Tab_Attendance"),
            headerTransparent: runsIOS26,
            headerLargeTitle: true,
            presentation: "modal",
            headerBackground: AndroidHeaderBackground
          }}
        />
      </Stack>
    </View>
  );
}
