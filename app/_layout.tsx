import 'react-native-reanimated';
import "@/utils/i18n";

import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';

import { screenOptions } from '@/utils/theme/ScreenOptions';
import { DarkTheme,DefaultTheme } from '@/utils/theme/Theme';
import { AlertProvider } from '@/ui/components/AlertProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    light: require('../assets/fonts/SNPro-Light.ttf'),
    regular: require('../assets/fonts/SNPro-Regular.ttf'),
    medium: require('../assets/fonts/SNPro-Medium.ttf'),
    semibold: require('../assets/fonts/SNPro-Semibold.ttf'),
    bold: require('../assets/fonts/SNPro-Bold.ttf'),
    black: require('../assets/fonts/SNPro-Black.ttf')
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {throw error;}
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#000000' : '#F5F5F5');
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AlertProvider>
        <Stack initialRouteName='(tabs)' screenOptions={{
                    ...screenOptions,
                    headerBackButtonDisplayMode: "minimal",
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="page" />
        </Stack>
      </AlertProvider>
    </ThemeProvider>
  );
}