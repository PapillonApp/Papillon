var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
export var PapillonLight = __assign(__assign({}, DefaultTheme), { colors: __assign(__assign({}, DefaultTheme.colors), { primary: "#29947A", background: "#FFFFFF", card: "#FFFFFF", text: "#000000", border: "#d5d5d5", notification: "#29947A" }) });
export var PapillonDark = __assign(__assign({}, DarkTheme), { colors: __assign(__assign({}, DarkTheme.colors), { primary: "#29947A", background: "#0a0a0a", card: "#111111", text: "#FFFFFF", border: "#252525", notification: "#29947A" }) });
