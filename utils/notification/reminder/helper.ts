import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ScheduledNotification = {
  id: string;
  title?: string;
  body?: string;
  data?: unknown;
  trigger: Notifications.SchedulableNotificationTriggerInput;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let finalStatus = settings.status;

  if (Platform.OS === 'ios') {
    const iosStatus = settings.ios?.status;
    if (iosStatus === Notifications.IosAuthorizationStatus.NOT_DETERMINED) {
      const result = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      finalStatus = result.status;
    }
  } else if (finalStatus !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    finalStatus = result.status;
  }

  return finalStatus === 'granted';
}

export async function scheduleNotification(
  content: { title?: string; body?: string; data?: any },
  trigger: Notifications.SchedulableNotificationTriggerInput
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({ content, trigger });
  return id;
}

export async function scheduleNotificationAtDate(
  title: string,
  body: string,
  date: Date,
  data?: unknown
): Promise<string> {
  return scheduleNotification(
    { title, body, data },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date }
  );
}

export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute = 0,
  data?: unknown
): Promise<string> {
  return scheduleNotification(
    { title, body, data },
    { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute, repeats: true }
  );
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
