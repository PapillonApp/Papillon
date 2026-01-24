import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import Countly from 'countly-sdk-react-native-bridge';
import CountlyConfig from 'countly-sdk-react-native-bridge/CountlyConfig';

import { initializeDatabaseOnStartup } from '@/database/utils/initialization';
import { initializeAccountManager } from '@/services/shared';
import { useSettingsStore } from '@/stores/settings';
import i18n from '@/utils/i18n';
import { checkConsent } from '@/utils/logger/consent';
import { log, warn } from '@/utils/logger/logger';
import ModelManager from '@/utils/magic/ModelManager';
import { FONT_CONFIG } from '@/constants/LayoutScreenOptions';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

let secrets = { APP_KEY: "", SALT: "", SERVER_URL: "" };

try {
  secrets = require('../secrets.json') ?? { APP_KEY: "", SALT: "", SERVER_URL: "" };
} catch {
  warn("No secrets.json file found, Countly will not be initialized properly.");
}

const APP_KEY = secrets.APP_KEY;
const SALT = secrets.SALT;
const SERVER_URL = secrets.SERVER_URL ?? "https://analytics.papillon.bzh";

export function useAppInitialization() {
  const [fontsLoaded, fontsError] = useFonts(FONT_CONFIG);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  
  // Settings
  const customLanguage = useSettingsStore(state => state.personalization.language);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);
  const selectedTheme = useSettingsStore(state => state.personalization.theme);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  // Initialize Theme if not set
  if (!selectedTheme) {
    mutateProperty('personalization', {
      theme: "auto"
    });
  }

  // Language Initialization
  useEffect(() => {
    if (customLanguage) {
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
  const [lastBackground, setLastBackground] = useState<Date | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (lastBackground) {
          const now = new Date();
          const durationMs = now.getTime() - lastBackground.getTime();

          if (durationMs > 5 * 60 * 1000) {
            initializeAccountManager();
          }
        }
      }

      if (nextAppState === "background") {
        setLastBackground(new Date());
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lastBackground]);

  // Magic/ModelManager Initialization
  useEffect(() => {
    if (magicEnabled) {
      ModelManager.safeInit();
    }
  }, [magicEnabled]);

  // Countly Initialization
  useEffect(() => {
    async function initializeCountly() {
      const consent = await checkConsent();
      log(`Countly Consent: ${JSON.stringify(consent)}`);

      const countlyConfig = new CountlyConfig(SERVER_URL, APP_KEY);
      countlyConfig.setRequiresConsent(true);
      countlyConfig.setLoggingEnabled(false);
      countlyConfig.enableCrashReporting();
      countlyConfig.enableParameterTamperingProtection(SALT);

      if (consent.given) {
        if (consent.advanced) {
          countlyConfig.giveConsent(["sessions", "crashes", "users", "location", "attribution", "push", "star-rating", "feedback"]);
        }

        if (consent.optional) {
          countlyConfig.giveConsent(["sessions", "crashes", "users"]);
        }

        if (consent.required) {
          countlyConfig.giveConsent(["sessions"]);
        }

        if (consent.required || consent.optional || consent.advanced) {
          await Countly.initWithConfig(countlyConfig);
        }
      }
    }

    initializeCountly();
  }, []);

  // Error Handling for Fonts
  const handleError = useCallback(() => {
    if (fontsError) { throw fontsError; }
  }, [fontsError]);

  useEffect(handleError, [handleError]);

  // Splash Screen Handling
  const hideSplashScreen = useCallback(async () => {
    if (fontsLoaded && isDatabaseReady) {
      // We don't hide it here anymore, FakeSplash handles the visual transition
      // But we could signal readiness
    }
  }, [fontsLoaded, isDatabaseReady]);

  useEffect(() => {
    hideSplashScreen();
  }, [hideSplashScreen]);

  return {
    isAppReady: isDatabaseReady && fontsLoaded,
    fontsLoaded,
    fontsError
  };
}
