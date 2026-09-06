
import 'react-native-reanimated';
import "@/utils/i18n";

import { Buffer } from 'buffer';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSegments } from 'expo-router';

import { AppProviders } from '@/components/AppProviders';
import FakeSplash from '@/components/FakeSplash';
import { RootNavigator } from '@/components/RootNavigator';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useNetworkStore } from '@/stores/logs';
import { checkConsent } from '@/utils/logger/consent';
import { posthog } from '@/utils/logger/posthog';
import uuid from '@/utils/uuid/uuid';
import { LogBox } from 'react-native';

// Polyfill Buffer
global.Buffer = Buffer;

LogBox.ignoreLogs([
  "Require cycle:",
  "i18next is made possible by our own product, Locize",
  'Route "./',
  "Linking found multiple possible URI schemes in your Expo config.",
  "[Layout children]: No route named",
  "Found screens with the same name nested inside one another.",
  "Account manager not initialized. Call initializeAccountManager first.",
  "Manager is null, skipping timetable fetch",
  "Installing bindings...",
  "Successfully installed!",
]);

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();
  const segments = useSegments();
  const lastTrackedView = useRef<string | null>(null);

  const analyticsView = useMemo(() => {
    if (segments.length === 0) return null;

    const groupMatch = segments[0].match(/^\((.+)\)$/);
    if (groupMatch) {
      const group = groupMatch[1];
      const rest = segments.slice(1).join('/');
      return rest ? `${group}:${rest}` : group;
    }

    return segments.join('/');
  }, [segments]);

  useEffect(() => {
    if (!analyticsView || lastTrackedView.current === analyticsView) return;

    const trackView = async () => {
      const consent = await checkConsent();
      if (!consent.given || consent.level !== "advanced") return;
      posthog.screen(analyticsView);
      lastTrackedView.current = analyticsView;
    };

    trackView();
  }, [analyticsView]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const id = uuid();
      let request: Request | null = null;
      if (args[0] instanceof Request && args[1] === undefined) {
        request = args[0];
      } else {
        request = new Request(...args);
      }

      try {
        useNetworkStore.getState().addRequest(request, id);
      } catch { }

      const response = await originalFetch(...args);

      try {
        useNetworkStore.getState().addResponse(response.clone(), id);
      } catch { }

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
