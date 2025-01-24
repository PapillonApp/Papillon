import { isExpoGo } from "@/utils/native/expoGoAlert";
import notifee, {
  AuthorizationStatus,
  Notification,
} from "@notifee/react-native";
import { Platform } from "react-native";

const requestNotificationPermission = async () => {
  if (isExpoGo()) return false;

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
};

const createChannelNotification = async () => {
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
    | "News"
    | "Homeworks"
    | "Grades"
    | "Lessons"
    | "Attendance"
    | "Evaluation"
) => {
  // Add timestamp for Android
  const timestamp = new Date().getTime();

  // Display a notification
  await notifee.displayNotification({
    ...props,
    android: {
      channelId,
      timestamp,
      showTimestamp: true,
      smallIcon: "@mipmap/ic_launcher_foreground",
      color: "#32AB8E",
      pressAction: {
        id: "default",
        launchActivity: "xyz.getpapillon.app.MainActivity",
      }
      // à intégrer => `actions`
    },
  });
};

export {
  requestNotificationPermission,
  createChannelNotification,
  papillonNotify,
};
