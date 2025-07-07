/* eslint-disable @typescript-eslint/no-require-imports */
import 'react-native-reanimated';
import "@/utils/i18n";

import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useMemo, useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';

import { AlertProvider } from '@/ui/components/AlertProvider';
import { screenOptions } from '@/utils/theme/ScreenOptions';
import { DarkTheme,DefaultTheme } from '@/utils/theme/Theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from "@/database/DatabaseProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// eslint-disable-next-line camelcase
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Pre-define font config to avoid recreating object on each render
const FONT_CONFIG = {
  light: require('../assets/fonts/SNPro-Light.ttf'),
  regular: require('../assets/fonts/SNPro-Regular.ttf'),
  medium: require('../assets/fonts/SNPro-Medium.ttf'),
  semibold: require('../assets/fonts/SNPro-Semibold.ttf'),
  bold: require('../assets/fonts/SNPro-Bold.ttf'),
  black: require('../assets/fonts/SNPro-Black.ttf')
} as const;

// Pre-define screen options to avoid recreating object
const STACK_SCREEN_OPTIONS = {
  headerBackButtonDisplayMode: "minimal" as const,
};

const ALERT_SCREEN_OPTIONS = {
  headerShown: false,
  presentation: 'formSheet' as const,
  sheetAllowedDetents: Platform.OS === 'ios' ? 'fitToContents' as const : [0.9],
  sheetBorderRadius: Platform.OS === 'ios' ? undefined : 16,
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

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_CONFIG);

  // Memoize error handler to prevent recreation
  const handleError = useCallback(() => {
    if (error) {throw error;}
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

const RootLayoutNav = React.memo(function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Memoize theme selection to prevent unnecessary re-computations
  const theme = useMemo(() => {
    return colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  }, [colorScheme]);

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
    SystemUI.setBackgroundColorAsync(backgroundColor);
    StatusBar.setBarStyle(statusBarStyle);
  }, [backgroundColor, statusBarStyle]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider value={theme}>
          <AlertProvider>
            <Stack initialRouteName='(tabs)' screenOptions={stackScreenOptions}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="page" />
              <Stack.Screen name="demo" options={DEMO_SCREEN_OPTIONS}/>
              <Stack.Screen name="devmode" options={DEVMODE_SCREEN_OPTIONS} />
              <Stack.Screen name="alert" options={ALERT_SCREEN_OPTIONS} />
            </Stack>
          </AlertProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
});