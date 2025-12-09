/* eslint-disable @typescript-eslint/no-require-imports */
import 'react-native-reanimated';
import "@/utils/i18n";
import { Buffer } from 'buffer';
import React from 'react';

import FakeSplash from '@/components/FakeSplash';
import { AppProviders } from '@/components/AppProviders';
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
      <FakeSplash isAppReady={isAppReady} />
      <RootNavigator />
    </AppProviders>
  );
}