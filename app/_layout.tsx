
import 'react-native-reanimated';
import "@/utils/i18n";

import { Buffer } from 'buffer';
import React, { useEffect } from 'react';

import { AppProviders } from '@/components/AppProviders';
import FakeSplash from '@/components/FakeSplash';
import { RootNavigator } from '@/components/RootNavigator';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useNetworkStore } from '@/stores/logs';
import uuid from '@/utils/uuid/uuid';

// Polyfill Buffer
global.Buffer = Buffer;

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const id = uuid()
      const request = new Request(...args);

      useNetworkStore.getState().addRequest(request, id);
      const response = await originalFetch(...args);
      useNetworkStore.getState().addResponse(response.clone(), id);

      return response;
    }

    return () => {
      window.fetch = originalFetch;
    }
  }, [])

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