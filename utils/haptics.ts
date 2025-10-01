import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Triggers an impact haptic feedback if the platform supports it (i.e., not on Windows).
 * @param {Haptics.ImpactFeedbackStyle} style - The intensity of the haptic feedback. Defaults to Light.
 */
export function triggerImpactHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'windows') {
    Haptics.impactAsync(style);
  }
  // On Windows, this function is a no-op.
}

/**
 * Triggers a notification haptic feedback if the platform supports it (i.e., not on Windows).
 * @param {Haptics.NotificationFeedbackType} type - The type of notification feedback. Defaults to Success.
 */
export function triggerNotificationHaptic(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) {
    if (Platform.OS !== 'windows') {
        Haptics.notificationAsync(type);
    }
    // On Windows, this function is a no-op.
}

// Re-exporting enums for convenience, so consumers of this module don't
// have to import from 'expo-haptics' directly.
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';