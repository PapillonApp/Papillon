import Constants, { ExecutionEnvironment } from "expo-constants";
import { useAlert } from "@/providers/AlertProvider";
import { MonitorSmartphone } from "lucide-react-native";

export const isExpoGo = () => {
  return Constants.executionEnvironment !== ExecutionEnvironment.Bare;
};

export const alertExpoGo = (showAlert: ReturnType<typeof useAlert>["showAlert"]) => {
  return showAlert({
    title: "Tu développes à l'aide d'Expo Go",
    message: "Sous Expo Go, les appels aux API natives sont indisponibles. Utilise un build de développement pour accéder à toutes les fonctionnalités.",
    icon: <MonitorSmartphone />,
  });
};
