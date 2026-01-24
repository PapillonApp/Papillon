import { Platform } from 'react-native';
import "@/utils/i18n";
import { t } from 'i18next';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

export const FONT_CONFIG = {
  light: require('../assets/fonts/SNPro-Light.ttf'),
  regular: require('../assets/fonts/SNPro-Regular.ttf'),
  medium: require('../assets/fonts/SNPro-Medium.ttf'),
  semibold: require('../assets/fonts/SNPro-Semibold.ttf'),
  bold: require('../assets/fonts/SNPro-Bold.ttf'),
  black: require('../assets/fonts/SNPro-Black.ttf'),
  serif_light: require('../assets/fonts/NotoSerif-Light.ttf'),
  serif_regular: require('../assets/fonts/NotoSerif-Regular.ttf'),
  serif_medium: require('../assets/fonts/NotoSerif-Medium.ttf'),
  serif_bold: require('../assets/fonts/NotoSerif-Bold.ttf'),
  serif_black: require('../assets/fonts/NotoSerif-Black.ttf'),
} as const;

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
  headerTitle: "DevMode",
  headerBackButtonDisplayMode: "minimal" as const,
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
