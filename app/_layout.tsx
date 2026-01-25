
import 'react-native-reanimated';
import "@/utils/i18n";

import { Buffer } from 'buffer';
import React from 'react';

import { AppProviders } from '@/components/AppProviders';
import FakeSplash from '@/components/FakeSplash';
import { RootNavigator } from '@/components/RootNavigator';
import { useAppInitialization } from '@/hooks/useAppInitialization';

// Polyfill Buffer
global.Buffer = Buffer;

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <FakeSplash isAppReady={isAppReady} instant={true} />
      <RootNavigator />
    </AppProviders>
  );
}