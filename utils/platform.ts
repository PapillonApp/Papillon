import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWindows = Platform.OS === 'windows';
export const isWeb = Platform.OS === 'web';

export const isMobile = isIOS || isAndroid;
export const isDesktop = isWindows; // For now, we only support Windows as a desktop platform.