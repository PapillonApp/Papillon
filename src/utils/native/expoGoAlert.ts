import { Alert } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

export const isExpoGo = () => {
  return Constants.executionEnvironment !== ExecutionEnvironment.Bare;
};

export const alertExpoGo = async () => {
  Alert.alert(
    "Tu développes à l'aide d'Expo Go",
    "Sous Expo Go, les appels aux API natives sont indisponibles. Utilise un build de développement pour accéder à toutes les fonctionnalités."
  );
};
