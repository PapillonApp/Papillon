import { useAlert } from "@/providers/AlertProvider";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { Notification } from "@notifee/react-native";
import { Platform } from "react-native";

const requestNotificationPermission = async (
  showAlert: ReturnType<typeof useAlert>["showAlert"]
) => {
  if (!isExpoGo()) {
    const notifee = (await import("@notifee/react-native")).default;
    const AuthorizationStatus = (await import("@notifee/react-native")).AuthorizationStatus;

    const settings = await notifee.requestPermission();
    if (Platform.OS === "ios") {
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        return true;
      }
      return false;
    } else {
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        return true;
      }
      return false;
    }
  } else {
    alertExpoGo(showAlert);
    return undefined;
  }
};

const createChannelNotification = async () => {
  const notifee = (await import("@notifee/react-native")).default;
  const AndroidImportance = (await import("@notifee/react-native")).AndroidImportance;

  await notifee.createChannel({
    id: "Test",
    name: "Test",
    description: "Permet de tester les notifications",
    sound: "default",
  });

  if (__DEV__) {
    await notifee.createChannel({
      id: "Status",
      name: "Statut du background",
      description: "Affiche quand le background est actuellement actif",
      vibration: false,
      importance: AndroidImportance.MIN,
      badge: false,
    });
  }

  await notifee.createChannelGroup({
    id: "Papillon",
    name: "Notifications Scolaires",
    description: "Permet de ne rien rater de ta vie scolaire",
  });

  await notifee.createChannel({
    id: "News",
    groupId: "Papillon",
    name: "Actualités",
    description: "Te notifie lorsque tu as de nouvelles actualités",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Homeworks",
    groupId: "Papillon",
    name: "Nouveau Devoir",
    description: "Te notifie lorsque tu as de nouveaux devoirs",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Grades",
    groupId: "Papillon",
    name: "Notes",
    description: "Te notifie lorsque tu as de nouvelles notes",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Lessons",
    groupId: "Papillon",
    name: "Emploi du temps",
    description: "Te notifie lorsque ton emploi du temps du jour est modifié",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Attendance",
    groupId: "Papillon",
    name: "Vie Scolaire",
    description:
      "Te notifie lorsque tu as de nouvelles absences/retards/observations/punitions",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Evaluation",
    groupId: "Papillon",
    name: "Compétences",
    description: "Te notifie lorsque tu as de nouvelles compétences",
    sound: "default",
  });
};

const papillonNotify = async (
  props: Notification,
  channelId:
    | "Test"
    | "Status"
    | "News"
    | "Homeworks"
    | "Grades"
    | "Lessons"
    | "Attendance"
    | "Evaluation"
) => {
  const notifee = (await import("@notifee/react-native")).default;
  const AndroidColor = (await import("@notifee/react-native")).AndroidColor;

  // Add timestamp for Android
  const timestamp = new Date().getTime();

  // Get badge count
  let badgeCount = await notifee.getBadgeCount();
  if (channelId !== "Status") {
    badgeCount++;
  }

  // Display a notification
  await notifee.displayNotification({
    ...props,
    android: {
      channelId,
      timestamp,
      badgeCount,
      showTimestamp: channelId !== "Status" ? true : false,
      showChronometer: channelId === "Status" ? true : false,
      smallIcon: "@mipmap/ic_launcher_foreground",
      color: AndroidColor.GREEN,
      pressAction: {
        id: "default",
        launchActivity: "default",
      }
    },
    ios: {
      threadId: channelId,
      badgeCount,
      sound: channelId !== "Status" ? "default" : "",
    }
  });
};

export {
  requestNotificationPermission,
  createChannelNotification,
  papillonNotify,
};
