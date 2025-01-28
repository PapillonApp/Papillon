import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { Notification } from "@notifee/react-native";

const requestNotificationPermission = () => {
  return async () => {
    if (!isExpoGo()) {
      const notifee = (await import("@notifee/react-native")).default;
      await notifee.requestPermission();
    } else {
      alertExpoGo();
      return false;
    }
  };
};

const papillonNotify = async (props: Notification) => {
  if (!isExpoGo()) {
    const notifee = (await import("@notifee/react-native")).default;
    await notifee.displayNotification({
      ...props,
      title: props.title || "Coucou, c'est Papillon 👋",
    });
  }
};

export {
  requestNotificationPermission,
  papillonNotify,
};
