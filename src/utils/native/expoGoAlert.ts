import { Alert } from "react-native";
import Constants from "expo-constants";

export const isExpoGo = () => {
  return Constants.expoConfig?.extra?.EXPO_ENV === "expo";
};

export const alertExpoGo = async () => {
  Alert.alert(
    "Tu développes à l'aide d'Expo Go",
    "Sous Expo Go, les appels aux API natives sont indisponibles. Utilise un build de développement pour accéder à toutes les fonctionnalités.",
  );
};
