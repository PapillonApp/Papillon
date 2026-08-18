import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { initializeDatabaseOnStartup } from '@/database/utils/initialization';
import { clearSpotlightIndex, reindexSpotlight } from '@/modules/papillon-native/src';
import { initializeAccountManager, subscribeManagerUpdate } from '@/services/shared';
import { useAccountStore } from '@/stores/account';
import { useSettingsStore } from '@/stores/settings';
import i18n from '@/utils/i18n';
import { registerSpotlightRefreshTask } from '@/utils/background/spotlightRefreshTask';
import { warn } from '@/utils/logger/logger';
import ModelManager from '@/utils/magic/ModelManager';
import { FONT_CONFIG } from '@/constants/LayoutScreenOptions';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function useAppInitialization() {
  const [fontsLoaded, fontsError] = useFonts(FONT_CONFIG);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  
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

  // Database Initialization
  useEffect(() => {
    async function initDatabase() {
      try {
        await initializeDatabaseOnStartup();
      } catch (err) {
        warn(`Database initialization failed: ${err}`);
      } finally {
        setIsDatabaseReady(true);
      }
    }

    initDatabase();
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

  // Spotlight/Siri: background refresh registration
  useEffect(() => {
    registerSpotlightRefreshTask().catch(e => warn(`Spotlight background task registration failed: ${e}`));
  }, []);

  // Spotlight/Siri: opportunistic reindex whenever the account manager (re)connects
  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate(manager => {
      const accountIds = manager.getAccount().services.map(service => service.id);
      reindexSpotlight(accountIds).catch(e => warn(`Spotlight reindex failed: ${e}`));
    });

    return unsubscribe;
  }, []);

  // Spotlight/Siri: clear the index whenever the active account changes or is removed
  useEffect(() => {
    let previousAccountId = useAccountStore.getState().lastUsedAccount;

    const unsubscribe = useAccountStore.subscribe(state => {
      const nextAccountId = state.lastUsedAccount;
      if (nextAccountId === previousAccountId) { return; }
      previousAccountId = nextAccountId;
      clearSpotlightIndex().catch(e => warn(`Spotlight clear failed: ${e}`));
    });

    return unsubscribe;
  }, []);

  // Magic/ModelManager Initialization
  useEffect(() => {
    if (magicEnabled) {
      ModelManager.safeInit();
    }
  }, [magicEnabled]);

  // Error Handling for Fonts
  const handleError = useCallback(() => {
    if (fontsError) { throw fontsError; }
  }, [fontsError]);

  useEffect(handleError, [handleError]);

  return {
    isAppReady: isDatabaseReady && fontsLoaded,
    fontsLoaded,
    fontsError
  };
}
