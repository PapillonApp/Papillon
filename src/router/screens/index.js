var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import welcome from "@/router/screens/welcome";
import login from "@/router/screens/login";
import views from "@/router/screens/views";
import createScreen from "../helpers/create-screen";
import { SettingsScreen } from "./settings/navigator";
import AccountScreen from "./account/stack";
import { Platform } from "react-native";
export default __spreadArray(__spreadArray(__spreadArray(__spreadArray([], welcome, true), login, true), views, true), [
    createScreen("SettingStack", SettingsScreen, {
        headerShown: false,
        presentation: Platform.OS === "android" ? "modal" : "formSheet",
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
        animationDuration: 100,
    }),
    createScreen("AccountStack", AccountScreen, {
        headerShown: false,
        gestureEnabled: false,
        animation: Platform.OS === "android" ? "slide_from_right" : "none",
        animationDuration: 100,
    }),
], false);
