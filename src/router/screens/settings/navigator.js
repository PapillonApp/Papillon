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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import screens from ".";
import { navigatorScreenOptions } from "@/router/helpers/create-screen";
import AlertProvider from "@/providers/AlertProvider";
import { Platform, View } from "react-native";
export var SettingsStack = createNativeStackNavigator();
export var SettingsScreen = function (_a) {
    var route = _a.route;
    return (<ConditionnalAlertProvider>
      <SettingsStack.Navigator screenOptions={navigatorScreenOptions}>
        {screens.map(function (screen) { return (
        // @ts-expect-error : type not compatible, but it works fine.
        <SettingsStack.Screen key={screen.name} {...screen} initialParams={__assign({}, route.params)}/>); })}
      </SettingsStack.Navigator>
    </ConditionnalAlertProvider>);
};
var ConditionnalAlertProvider = function (props) {
    if (Platform.OS === "android") {
        return (<View style={{ flex: 1 }}>
        {props.children}
      </View>);
    }
    return (<AlertProvider>
      {props.children}
    </AlertProvider>);
};
