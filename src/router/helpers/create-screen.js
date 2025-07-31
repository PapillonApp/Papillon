import { Platform } from "react-native";
export var navigatorScreenOptions = {
    headerBackTitleStyle: {
        fontFamily: "medium",
    },
    headerTitleStyle: {
        fontFamily: "semibold",
    },
    headerBackTitle: "Retour"
};
var createScreen = function (name, component, options) {
    if (options === void 0) { options = {}; }
    if (!options.animation && Platform.OS === "android") {
        options.animation = options.presentation === "modal" ? "slide_from_bottom" : "slide_from_right";
    }
    return {
        name: name,
        component: component,
        options: options
    };
};
export default createScreen;
