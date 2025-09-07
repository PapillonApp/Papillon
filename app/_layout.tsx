/* eslint-disable @typescript-eslint/no-require-imports */
import 'react-native-reanimated';
import "@/utils/i18n";

import { MMKV } from 'react-native-mmkv'

import Countly from 'countly-sdk-react-native-bridge';
import CountlyConfig from 'countly-sdk-react-native-bridge/CountlyConfig';

let secrets = { APP_KEY: "", SALT: "", SERVER_URL: "" };

try {
  secrets = require('../secrets.json') ?? { APP_KEY: "", SALT: "", SERVER_URL: "" };
} catch {
  console.warn("No secrets.json file found, Countly will not be initialized properly.");
}

const APP_KEY = secrets.APP_KEY;
const SALT = secrets.SALT;
const SERVER_URL = secrets.SERVER_URL ?? "https://analytics.papillon.bzh";

import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DatabaseProvider } from "@/database/DatabaseProvider";
import { AlertProvider } from '@/ui/components/AlertProvider';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { screenOptions } from '@/utils/theme/ScreenOptions';
import { DarkTheme, DefaultTheme } from '@/utils/theme/Theme';
import { t } from 'i18next';
import { useSettingsStore } from '@/stores/settings';
import { AppColors } from "@/utils/colors";
import ModelManager from '@/utils/magic/ModelManager';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Pre-define font config to avoid recreating object on each render
const FONT_CONFIG = {
  light: require('../assets/fonts/SNPro-Light.ttf'),
  regular: require('../assets/fonts/SNPro-Regular.ttf'),
  medium: require('../assets/fonts/SNPro-Medium.ttf'),
  semibold: require('../assets/fonts/SNPro-Semibold.ttf'),
  bold: require('../assets/fonts/SNPro-Bold.ttf'),
  black: require('../assets/fonts/SNPro-Black.ttf'),
  serif_light: require('../assets/fonts/NotoSerif-Light.ttf'),
  serif_regular: require('../assets/fonts/NotoSerif-Regular.ttf'),
  serif_medium: require('../assets/fonts/NotoSerif-Medium.ttf'),
  serif_bold: require('../assets/fonts/NotoSerif-Bold.ttf'),
  serif_black: require('../assets/fonts/NotoSerif-Black.ttf'),
} as const;

// Pre-define screen options to avoid recreating object
const STACK_SCREEN_OPTIONS = {
  headerBackButtonDisplayMode: "minimal" as const,
};

const ALERT_SCREEN_OPTIONS = {
  headerShown: false,
  presentation: 'formSheet' as const,
  sheetAllowedDetents: Platform.OS === 'ios' ? 'fitToContents' as const : [0.9],
  sheetCornerRadius: 32,
  sheetGrabberVisible: false,
  sheetExpandsWhenScrolledToEdge: false,
  sheetInitialDetentIndex: 0,
} as const;

const DEVMODE_SCREEN_OPTIONS = {
  headerTitle: "DevMode",
  headerBackButtonDisplayMode: "minimal" as const,
} as const;

const DEMO_SCREEN_OPTIONS = {
  headerTitle: "Components Demo",
  headerBackButtonDisplayMode: "minimal" as const,
}

const CONSENT_SCREEN_OPTIONS = {
  gesturesEnabled: false,
  fullScreenGestureEnabled: false,
  presentation: "fullScreenModal" as const,
  backButtonVisible: false,
  headerLargeTitle: false,
  headerShown: false,

} as const;

const CHANGELOG_SCREEN_OPTIONS = {
  headerTitle: t("Changelog_Title"),
  headerLargeTitle: false,
}

const AI_SCREEN_OPTIONS = {
  headerTitle: "AI",
  headerShown: false,
}

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_CONFIG);

  // Memoize error handler to prevent recreation
  const handleError = useCallback(() => {
    if (error) { throw error; }
  }, [error]);

  // Memoize splash screen handler
  const hideSplashScreen = useCallback(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(handleError, [handleError]);
  useEffect(hideSplashScreen, [hideSplashScreen]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { Buffer } from 'buffer';
import { checkConsent } from '@/utils/logger/consent';

const RootLayoutNav = React.memo(function RootLayoutNav() {
  global.Buffer = Buffer
  const colorScheme = useColorScheme();
  const selectedTheme = useSettingsStore(state => state.personalization.theme);

  const selectedColorEnum = useSettingsStore(state => state.personalization.colorSelected);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  const color = useMemo(() => {
    const color = selectedColorEnum != null ? AppColors.find(appColor => appColor.colorEnum === selectedColorEnum) : null;
    return color || AppColors[0]; // Fallback vers la première couleur si aucune n'est trouvée
  }, [selectedColorEnum]);

  useEffect(() => {
    if (magicEnabled) {
      ModelManager.safeInit();
    }
  }, [magicEnabled]);

  useEffect(() => {
    /*
    DONNÉES D'ANALYSE : serveur Countly (https://countly.papillon.bzh)

    - full opt out possible

    - sessions (obligatoire) : durée d'utilisation, nombre d'ouvertures
    - crashes (optionnel) : rapports de crash (inclut les logs)
    - users (optionnel) : service utilisé, ENT, détails d'usage groupés sans données d'identification
    */

    async function initializeCountly() {
      const consent = await checkConsent();
      console.log("Countly Consent:", consent);

      const countlyConfig = new CountlyConfig(SERVER_URL, APP_KEY);
      countlyConfig.setRequiresConsent(true);
      countlyConfig.setLoggingEnabled(false);
      countlyConfig.enableCrashReporting();
      countlyConfig.enableParameterTamperingProtection(SALT);

      if (consent.given) {
        if (consent.advanced) {
          countlyConfig.giveConsent(["sessions", "crashes", "users", "location", "attribution", "push", "star-rating", "feedback"]);
        }

        if (consent.optional) {
          countlyConfig.giveConsent(["sessions", "crashes", "users"]);
        }

        if (consent.required) {
          countlyConfig.giveConsent(["sessions"]);
        }

        if (consent.required || consent.optional || consent.advanced) {
          await Countly.initWithConfig(countlyConfig);
        }
      }
    }

    initializeCountly();
  }, [])

  // Memoize theme selection to prevent unnecessary re-computations
  const theme = useMemo(() => {
    const newScheme = selectedTheme === 'auto' ? (colorScheme === 'dark' ? DarkTheme : DefaultTheme) : (selectedTheme === 'dark' ? DarkTheme : DefaultTheme);
    return {
      ...newScheme,
      colors: {
        ...newScheme.colors,
        primary: color?.mainColor ?? newScheme.colors.primary,
      },
    };
  }, [colorScheme, color, selectedTheme]);

  // Memoize background color to prevent string recreation
  const backgroundColor = useMemo(() => {
    return colorScheme === 'dark' ? '#000000' : '#F5F5F5';
  }, [colorScheme]);

  // Memoize status bar style to prevent string recreation
  const statusBarStyle = useMemo(() => {
    return colorScheme === 'dark' ? 'light-content' : 'dark-content';
  }, [colorScheme]);

  // Memoize combined screen options to prevent object recreation
  const stackScreenOptions = useMemo(() => ({
    ...screenOptions,
    ...STACK_SCREEN_OPTIONS,
  }), []);

  // Combined effect for system UI updates to reduce effect overhead
  useEffect(() => {
    if (runsIOS26) {
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
    else {
      SystemUI.setBackgroundColorAsync("#000000");
    }
    StatusBar.setBarStyle(statusBarStyle);
  }, [backgroundColor, statusBarStyle]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
      <DatabaseProvider>
        <ThemeProvider value={theme}>
          <AlertProvider>
            <Stack initialRouteName='(tabs)' screenOptions={stackScreenOptions}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen name="(new)" options={{ headerShown: false, presentation: "modal" }} />
              <Stack.Screen name="(settings)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: "modal" }} />
              <Stack.Screen name="page" />
              <Stack.Screen name="demo" options={DEMO_SCREEN_OPTIONS} />
              <Stack.Screen name="consent" options={CONSENT_SCREEN_OPTIONS} />
              <Stack.Screen name="changelog" options={CHANGELOG_SCREEN_OPTIONS} />
              <Stack.Screen name="ai" options={AI_SCREEN_OPTIONS} />
              <Stack.Screen name="devmode" options={DEVMODE_SCREEN_OPTIONS} />
              <Stack.Screen name="alert" options={ALERT_SCREEN_OPTIONS} />

              <Stack.Screen
                name="(modals)/grade"
                options={{
                  headerShown: Platform.OS === 'ios' ? runsIOS26 : true,
                  headerTitle: t("Modal_Grades_Title"),
                  presentation: "modal",
                  headerTransparent: Platform.OS === 'ios' ? runsIOS26 : false,
                  contentStyle: {
                    borderRadius: Platform.OS === 'ios' ? 30 : 0,
                    overflow: Platform.OS === 'ios' ? "hidden" : "visible",
                  },
                }}
              />
              <Stack.Screen
                name="(modals)/course"
                options={{
                  headerShown: Platform.OS === 'ios' ? runsIOS26 : true,
                  headerTitle: t("Modal_Course_Title"),
                  headerTransparent: Platform.OS === 'ios' ? runsIOS26 : false,
                  presentation: "modal",
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
                name="(features)/(cards)/cards"
                options={{
                  headerShown: true,
                  presentation: "modal",
                  headerTitle: t("Profile_QRCards"),
                  headerTransparent: false,
                }}
              />

              <Stack.Screen
                name="(features)/(cards)/specific"
                options={{
                  headerShown: true,
                  presentation: "modal",
                  headerTitle: t("Profile_QRCards"),
                  headerTransparent: true,
                }}
              />

              <Stack.Screen
                name="(features)/(cards)/qrcode"
                options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
                  headerTitle: "QR-Code",
                  headerTransparent: true,
                }}
              />

              <Stack.Screen
                name="(features)/attendance"
                options={{
                  headerShown: true,
                  headerTitle: t("Tab_Attendance"),
                  headerTransparent: runsIOS26,
                  headerLargeTitle: true,
                  presentation: "modal"
                }}
              />
            </Stack>
          </AlertProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
});