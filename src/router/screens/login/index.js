var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import createScreen from "@/router/helpers/create-screen";
import pronote from "./pronote";
import ecoledirecte from "./ecoledirecte";
import ServiceSelector from "@/views/login/ServiceSelector";
import skolengo from "./skolengo";
import identityProvider from "./identityProvider";
import { Platform } from "react-native";
export default __spreadArray(__spreadArray(__spreadArray(__spreadArray([
    createScreen("ServiceSelector", ServiceSelector, {
        headerTitle: "",
        headerTransparent: true,
        headerBackVisible: true,
        animation: Platform.OS === "android" ? "slide_from_bottom" : undefined,
        animationDuration: 250,
    })
], pronote, true), ecoledirecte, true), skolengo, true), identityProvider, true);
