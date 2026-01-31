import "react-native-reanimated";
import "@/utils/i18n";

import { Buffer } from "buffer";
import React, { useEffect } from "react";

import { AppProviders } from "@/components/AppProviders";
import FakeSplash from "@/components/FakeSplash";
import { RootNavigator } from "@/components/RootNavigator";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { SplashScreen } from "expo-router";

// Polyfill Buffer
global.Buffer = Buffer;

// Splashscreen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();
  const [splashCanFadeOut, setSplashCanFadeOut] = React.useState(false);

  useEffect(() => {
    if (isAppReady && fontsLoaded) {
      // This timeout prevent the app to render the fade for SplashScreen
      setTimeout(() => {
        setSplashCanFadeOut(true);
      }, 10);
    }
  }, [isAppReady, fontsLoaded]);

  if (!fontsLoaded && !isAppReady) {
    // We can't mount the app at this state because this will load the database and break the migration
    return <FakeSplash isAppReady={isAppReady} instant={splashCanFadeOut} />;
  }

  return (
    <AppProviders>
      <FakeSplash isAppReady={isAppReady} instant={splashCanFadeOut} />
      <RootNavigator />
    </AppProviders>
  );
}