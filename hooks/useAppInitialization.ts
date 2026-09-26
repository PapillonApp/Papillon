import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { initializeDatabaseOnStartup } from '@/database/utils/initialization';
import { configureTips, resetTipsDatastore, showAllTips } from '@/modules/papillon-tips';
import { initializeAccountManager } from '@/services/shared';
import { useSettingsStore } from '@/stores/settings';
import { useTipsStore } from '@/stores/tips';
import i18n from '@/utils/i18n';
import { checkConsent } from '@/utils/logger/consent';
import { warn } from '@/utils/logger/logger';
import { posthog } from '@/utils/logger/posthog';
import ModelManager from '@/utils/magic/ModelManager';
import { FONT_CONFIG } from '@/constants/LayoutScreenOptions';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function useAppInitialization() {
  const [fontsLoaded, fontsError] = useFonts(FONT_CONFIG);

  // Settings
  const customLanguage = useSettingsStore(state => state.personalization.language);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);
  const selectedTheme = useSettingsStore(state => state.personalization.theme);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  useEffect(() => {
    if (!selectedTheme) {
      mutateProperty('personalization', {
        theme: "auto"
      });
    }
  }, [mutateProperty, selectedTheme]);

  // Language Initialization
  useEffect(() => {
    if (customLanguage && i18n.language !== customLanguage) {
      i18n.changeLanguage(customLanguage).catch((error) => {
        console.error("Error changing language:", error);
      });
    }
  }, [customLanguage]);

  // TipKit Initialization
  // Has to happen before any tip is asked whether it should show, and exactly
  // once per process. `immediate` because our tips point at something on screen
  // right now — holding one back for an hour would point at nothing.
  //
  // A reset asked for from the debug menu is carried out here rather than
  // there: TipKit only lets its datastore be wiped before it is configured, so
  // this launch is the first chance to honour it.
  useEffect(() => {
    const setUpTips = async () => {
      const { pendingDatastoreReset, clearPendingDatastoreReset, forceAll } =
        useTipsStore.getState();

      if (pendingDatastoreReset) {
        await resetTipsDatastore();
        clearPendingDatastoreReset();
      }

      await configureTips('immediate');

      if (forceAll) {
        await showAllTips();
      }
    };

    setUpTips().catch(err => {
      warn(`TipKit configuration failed: ${err}`);
    });
  }, []);

  // Database Initialization
  // The WatermelonDB adapter is constructed synchronously at module load
  // (see database/index.ts), so it's already usable before this effect runs.
  // initializeDatabaseOnStartup() only runs diagnostic health checks, so it
  // does not need to gate app readiness / the splash screen.
  useEffect(() => {
    initializeDatabaseOnStartup().catch(err => {
      warn(`Database initialization failed: ${err}`);
    });
  }, []);

  // AppState Monitoring
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastBackgroundRef = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (lastBackgroundRef.current) {
          const now = Date.now();
          const durationMs = now - lastBackgroundRef.current;

          if (durationMs > 5 * 60 * 1000) {
            initializeAccountManager().catch(e => warn(`Background account refresh failed: ${e}`));
          }
        }
      }

      if (nextAppState === "background") {
        lastBackgroundRef.current = Date.now();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Magic/ModelManager Initialization
  useEffect(() => {
    if (magicEnabled) {
      ModelManager.safeInit();
    }
  }, [magicEnabled]);

  // PostHog Consent Sync
  useEffect(() => {
    async function syncPostHogConsent() {
      const consent = await checkConsent();

      if (consent.given && consent.level !== "none") {
        await posthog.optIn();
      } else {
        await posthog.optOut();
      }
    }

    syncPostHogConsent();
  }, []);

  // Error Handling for Fonts
  const handleError = useCallback(() => {
    if (fontsError) { throw fontsError; }
  }, [fontsError]);

  useEffect(handleError, [handleError]);

  return {
    isAppReady: fontsLoaded,
    fontsLoaded,
    fontsError
  };
}
