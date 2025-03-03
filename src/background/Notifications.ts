import { useAlert } from "@/providers/AlertProvider";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { Notification } from "@notifee/react-native";

const requestNotificationPermission = async () => {
  try {
    const { showAlert } = useAlert();

    if (!isExpoGo()) {
      console.log("Requesting notification permission...");
      const notifee = (await import("@notifee/react-native")).default;
      return notifee.requestPermission();
    } else {
      alertExpoGo(showAlert);
      return false;
    }
  }
  catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
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
