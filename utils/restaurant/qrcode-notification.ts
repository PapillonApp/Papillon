import { router } from "expo-router";

import { getWeekNumberFromDate } from "../../database/useHomework";
import { getManager } from "../../services/shared";
import { Capabilities } from "../../services/shared/types";
import { useAccountStore } from "../../stores/account";
import { Services } from "../../stores/account/types";

let isNavigating = false;
let lastNavigationTime = 0;

export interface QRCodeNotificationData {
  qrcode: string;
  type?: string;
  service?: Services;
}

export function isLunchBreak(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 11 && hour < 14;
}

export async function getLunchBreakStartTime(): Promise<Date | null> {
  try {
    const manager = getManager();
    const accounts = useAccountStore.getState().accounts;
    const lastUsedAccount = useAccountStore.getState().lastUsedAccount;

    const account = accounts.find(a => a.id === lastUsedAccount);
    if (!account) {
      return null;
    }

    const serviceWithTimetable = account.services.find(service => {
      return manager.clientHasCapatibility(Capabilities.TIMETABLE, service.id);
    });

    if (!serviceWithTimetable) {
      return null;
    }

    const today = new Date();
    const currentWeekNumber = getWeekNumberFromDate(today);
    const timetable = await manager.getWeeklyTimetable(currentWeekNumber);

    const todayString = today.toISOString().split("T")[0];
    const todayCourses = timetable.find(
      day => day.date.toISOString().split("T")[0] === todayString
    );

    if (!todayCourses || todayCourses.courses.length === 0) {
      return null;
    }

    const sortedCourses = todayCourses.courses.sort(
      (a, b) => a.from.getTime() - b.from.getTime()
    );

    for (let i = 0; i < sortedCourses.length - 1; i++) {
      const currentCourse = sortedCourses[i];
      const nextCourse = sortedCourses[i + 1];

      const currentEnd =
        currentCourse.to.getHours() + currentCourse.to.getMinutes() / 60;
      const nextStart =
        nextCourse.from.getHours() + nextCourse.from.getMinutes() / 60;

      if (
        currentEnd >= 11 &&
        currentEnd < 14 &&
        nextStart >= 11 &&
        nextStart < 14
      ) {
        const gapDuration = nextStart - currentEnd;

        if (gapDuration >= 0.5) {
          return currentCourse.to;
        }
      }
    }

    const defaultTime = new Date(today);
    defaultTime.setHours(11, 0, 0, 0);
    return defaultTime;
  } catch {
    const today = new Date();
    const defaultTime = new Date(today);
    defaultTime.setHours(11, 0, 0, 0);
    return defaultTime;
  }
}

export async function hasMealBookedToday(): Promise<{
  hasBooked: boolean;
  serviceId?: string;
  serviceType?: Services;
}> {
  try {
    const manager = getManager();
    const accounts = useAccountStore.getState().accounts;
    const lastUsedAccount = useAccountStore.getState().lastUsedAccount;

    if (!manager || !lastUsedAccount) {
      return { hasBooked: false };
    }

    const account = accounts.find(a => a.id === lastUsedAccount);
    if (!account) {
      return { hasBooked: false };
    }

    const serviceWithBooking = account.services.find(service => {
      return (
        manager.clientHasCapatibility(
          Capabilities.CANTEEN_BOOKINGS,
          service.id
        ) &&
        (service.serviceId === Services.TURBOSELF ||
          service.serviceId === Services.IZLY)
      );
    });

    if (!serviceWithBooking) {
      return { hasBooked: false };
    }

    const today = new Date();
    const weekNumber = getWeekNumberFromDate(today);
    const bookingWeek = await manager.getCanteenBookingWeek(
      weekNumber,
      serviceWithBooking.id
    );

    const todayBookings = bookingWeek.find(day => {
      const dayDate = new Date(day.date);
      const todayDate = new Date(today);
      return dayDate.toDateString() === todayDate.toDateString();
    });

    const hasBooked =
      todayBookings?.available.some(booking => booking.booked) ?? false;

    return {
      hasBooked,
      serviceId: serviceWithBooking.id,
      serviceType: serviceWithBooking.serviceId,
    };
  } catch {
    return { hasBooked: false };
  }
}

export async function getUserCanteenQRCode(
  serviceId: string,
  serviceType: Services
): Promise<QRCodeNotificationData | null> {
  try {
    const manager = getManager();

    const qrCode = await manager.getCanteenQRCodes(serviceId);

    return {
      qrcode: qrCode.data,
      type: qrCode.type === 0 ? "QR" : "BARCODE",
      service: serviceType,
    };
  } catch {
    return null;
  }
}

export async function scheduleQRCodeNotification(
  data: QRCodeNotificationData,
  delay: number = 2000
): Promise<void> {
  try {
    const Notifications = await import("expo-notifications");

    await Notifications.setNotificationChannelAsync("qrcode-lunch", {
      name: "QR Code Repas",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B6B",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      sound: "default",
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍽️ QR Code pour manger !",
        body: "Cliquez pour afficher votre code QR",
        categoryIdentifier: "qrcode-lunch",
        data: {
          route: "/(features)/(cards)/qrcode",
          params: {
            qrcode: data.qrcode,
            type: data.type || "QR",
            service: data.service || Services.TURBOSELF,
          },
        },
        sound: "default",
        badge: 1,
      },
      trigger: null,
    });
  } catch {
    const { Alert } = await import("react-native");
    setTimeout(() => {
      Alert.alert(
        "🍽️ QR Code pour manger !",
        "Cliquez pour afficher votre code QR",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Voir QR Code", onPress: () => openQRCodePage(data) },
        ]
      );
    }, delay);
  }
}

export function openQRCodePage(data: QRCodeNotificationData): void {
  const now = Date.now();

  if (isNavigating || now - lastNavigationTime < 5000) {
    return;
  }

  isNavigating = true;
  lastNavigationTime = now;

  router.push({
    pathname: "/(features)/(cards)/qrcode",
    params: {
      qrcode: data.qrcode,
      type: data.type || "QR",
      service: String(data.service || Services.TURBOSELF),
    },
  });

  setTimeout(() => {
    isNavigating = false;
  }, 5000);
}

export async function registerQRCodeNotificationRouting(): Promise<
  (() => void) | void
> {
  try {
    const Notifications = await import("expo-notifications");

    await Notifications.setNotificationChannelAsync("qrcode-lunch", {
      name: "QR Code Repas",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B6B",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      sound: "default",
    });

    Notifications.setNotificationHandler({
      handleNotification: async notification => {
        if (
          notification.request.content.categoryIdentifier === "qrcode-lunch"
        ) {
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          };
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        if (
          response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
          return;
        }

        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;

        if (data?.route === "/(features)/(cards)/qrcode" && data?.params) {
          const qrData = data.params as Record<string, string>;
          openQRCodePage({
            qrcode: qrData.qrcode || "",
            type: qrData.type || "QR",
            service: Number(qrData.service) || Services.TURBOSELF,
          });
        }
      }
    );

    await scheduleDailyLunchNotifications();

    return () => subscription.remove();
  } catch {}
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await import("expo-notifications");

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    }

    return true;
  } catch {
    return false;
  }
}

export async function sendSmartQRCodeNotification(): Promise<void> {
  if (!isLunchBreak()) {
    return;
  }

  const bookingInfo = await hasMealBookedToday();
  if (
    !bookingInfo.hasBooked ||
    !bookingInfo.serviceId ||
    !bookingInfo.serviceType
  ) {
    return;
  }

  const qrData = await getUserCanteenQRCode(
    bookingInfo.serviceId,
    bookingInfo.serviceType
  );
  if (!qrData) {
    return;
  }

  await scheduleQRCodeNotification(qrData, 0);
}

export async function scheduleDailyLunchNotifications(): Promise<void> {
  try {
    const Notifications = await import("expo-notifications");

    const bookingInfo = await hasMealBookedToday();
    if (
      !bookingInfo.hasBooked ||
      !bookingInfo.serviceId ||
      !bookingInfo.serviceType
    ) {
      return;
    }

    const qrCodeData = await getUserCanteenQRCode(
      bookingInfo.serviceId,
      bookingInfo.serviceType
    );
    if (!qrCodeData) {
      return;
    }

    const lunchBreakStartTime = await getLunchBreakStartTime();
    if (!lunchBreakStartTime) {
      return;
    }

    const now = new Date();

    if (lunchBreakStartTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ QR Code pour manger !",
          body: "Cliquez pour afficher votre code QR",
          categoryIdentifier: "qrcode-lunch",
          data: {
            route: "/(features)/(cards)/qrcode",
            params: {
              qrcode: qrCodeData.qrcode,
              type: qrCodeData.type || "QR",
              service: qrCodeData.service || Services.TURBOSELF,
            },
          },
          sound: "default",
          badge: 1,
        },
        trigger: lunchBreakStartTime,
      });
    }
  } catch {
    return;
  }
}

export async function testQRCodeNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  const testData = {
    qrcode: "TEST_QR_CODE_123456789",
    type: "QR",
    service: Services.TURBOSELF,
  };

  if (hasPermission) {
    await scheduleQRCodeNotification(testData, 1000);
  } else {
    const { Alert } = await import("react-native");
    setTimeout(() => {
      Alert.alert(
        "🍽️ QR Code pour manger !",
        "Cliquez pour afficher votre code QR",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Voir QR Code", onPress: () => openQRCodePage(testData) },
        ]
      );
    }, 1000);
  }
}
