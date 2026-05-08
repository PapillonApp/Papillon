
import 'react-native-reanimated';
import "@/utils/i18n";

import { Buffer } from 'buffer';
import React, { useEffect, useMemo, useRef } from 'react';
import Countly from 'countly-sdk-react-native-bridge';
import { useSegments } from 'expo-router';

import { AppProviders } from '@/components/AppProviders';
import FakeSplash from '@/components/FakeSplash';
import { RootNavigator } from '@/components/RootNavigator';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useNetworkStore } from '@/stores/logs';
import { checkConsent } from '@/utils/logger/consent';
import uuid from '@/utils/uuid/uuid';

// Polyfill Buffer
global.Buffer = Buffer;

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();
  const segments = useSegments();
  const lastTrackedView = useRef<string | null>(null);

  const analyticsView = useMemo(() => {
    if (segments.length < 2) return null;

    if (segments[0] === '(tabs)') {
      return `tab:${segments[1]}`;
    }

    if (segments[0] === '(features)') {
      return `feature:${segments.slice(1).join('/')}`;
    }

    return null;
  }, [segments]);

  useEffect(() => {
    if (!analyticsView || lastTrackedView.current === analyticsView) return;

    checkConsent().then((consent) => {
      if (!consent.given || !consent.advanced) return;
      Countly.recordView(analyticsView);
      lastTrackedView.current = analyticsView;
    });
  }, [analyticsView]);

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
