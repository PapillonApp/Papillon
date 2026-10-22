import { Platform } from 'react-native';
import "@/utils/i18n";
import { t } from 'i18next';
export { FONT_CONFIG } from '@/utils/theme/fonts';

export const STACK_SCREEN_OPTIONS = {
  headerBackButtonDisplayMode: "minimal" as const,
};

export const ALERT_SCREEN_OPTIONS = {
  headerShown: false,
  presentation: 'formSheet' as const,
  sheetAllowedDetents: Platform.OS === 'ios' ? 'fitToContents' as const : [0.9],
  sheetCornerRadius: Platform.OS === 'ios' ? undefined : 32,
  sheetGrabberVisible: false,
  sheetExpandsWhenScrolledToEdge: false,
  sheetInitialDetentIndex: 0,
} as const;

export const DEVMODE_SCREEN_OPTIONS = {
  headerTitle: "Mode développeur",
  headerLargeTitle: false,
  headerShown: true,
  backButtonVisible: true
} as const;

export const DEVMODE_REQUESTS_SCREEN_OPTIONS = {
  headerLargeTitle: false,
  headerShown: false,
  backButtonVisible: true
} as const;

export const DEMO_SCREEN_OPTIONS = {
  headerTitle: "Components Demo",
  headerBackButtonDisplayMode: "minimal" as const,
};

export const CONSENT_SCREEN_OPTIONS = {
  gesturesEnabled: false,
  fullScreenGestureEnabled: false,
  presentation: "fullScreenModal" as const,
  backButtonVisible: false,
  headerLargeTitle: false,
  headerShown: false,
} as const;

export const CHANGELOG_SCREEN_OPTIONS = {
  headerTitle: t("Changelog_Title"),
  headerLargeTitle: false,
};

export const AI_SCREEN_OPTIONS = {
  headerTitle: "AI",
  headerShown: false,
};
