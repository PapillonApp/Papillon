import Constants, { ExecutionEnvironment } from "expo-constants";
import { MonitorSmartphone } from "lucide-react-native";
export var isExpoGo = function () {
    return Constants.executionEnvironment !== ExecutionEnvironment.Bare;
};
export var alertExpoGo = function (showAlert) {
    return showAlert({
        title: "Tu développes à l'aide d'Expo Go",
        message: "Sous Expo Go, les appels aux API natives sont indisponibles. Utilise un build de développement pour accéder à toutes les fonctionnalités.",
        icon: <MonitorSmartphone />,
    });
};
