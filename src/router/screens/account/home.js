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
export var HomeStack = createNativeStackNavigator();
export var screenOptions = {
    headerBackTitleStyle: {
        fontFamily: "medium",
    },
    headerTitleStyle: {
        fontFamily: "semibold",
    },
    headerBackTitle: "Retour",
};
import * as SplashScreen from "expo-splash-screen";
import { useCurrentAccount } from "@/stores/account";
import createScreen from "@/router/helpers/create-screen";
import Home from "@/views/account/Home/Home";
import { Platform } from "react-native";
import { useEffect } from "react";
var HomeStackScreen = function (_a) {
    var accountScreens = _a.accountScreens;
    var account = useCurrentAccount(function (store) { return store.account; });
    var newAccountScreens = accountScreens;
    useEffect(function () {
        SplashScreen.hideAsync();
    }, []);
    if (account === null || account === void 0 ? void 0 : account.personalization.tabs) {
        var newTabs = account.personalization.tabs;
        newTabs = newTabs.filter(function (tab) { return !tab.enabled; });
        newAccountScreens = newTabs.map(function (tab) {
            var tabData = accountScreens.find(function (t) { return t.name === tab.name; });
            if (tabData) {
                tabData.options = __assign(__assign({}, tabData.options), { tabEnabled: tab.enabled, presentation: "modal", animation: Platform.OS === "android" ? "slide_from_bottom" : "default", sheetCornerRadius: 24 });
                return tabData;
            }
        }).filter(Boolean); // filter out undefined
    }
    else {
        for (var _i = 0, newAccountScreens_1 = newAccountScreens; _i < newAccountScreens_1.length; _i++) {
            var screen_1 = newAccountScreens_1[_i];
            screen_1.options.tabEnabled = true;
        }
    }
    // Add Home as the first tab.
    newAccountScreens.unshift(createScreen("HomeScreen", Home, {
        headerShown: false,
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
    }));
    return (<HomeStack.Navigator screenOptions={screenOptions}>
      {newAccountScreens.map(function (screen) { return (<HomeStack.Screen key={screen.name} {...screen} initialParams={{
                outsideNav: true
            }}/>); })}
    </HomeStack.Navigator>);
};
export default HomeStackScreen;
