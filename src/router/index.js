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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Platform, StatusBar, View, useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import screens from "@/router/screens";
import { PapillonDark, PapillonLight } from "@/router/helpers/themes";
import AlertProvider from "@/providers/AlertProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCurrentAccount } from "@/stores/account";
import { navigatorScreenOptions } from "./helpers/create-screen";
import { navigate } from "@/utils/logger/logger";
import { PapillonNavigation } from "./refs";
import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";
export var Stack = createNativeStackNavigator();
var Router = function () {
    var scheme = useColorScheme();
    var whatTheme = useThemeSoundHaptics().whatTheme;
    var account = useCurrentAccount(function (store) { return store.account; });
    var _a = useState(scheme === "dark" ? PapillonDark : PapillonLight), theme = _a[0], setTheme = _a[1];
    var _b = useState(theme.colors.primary), primaryColor = _b[0], setPrimaryColor = _b[1];
    useEffect(function () {
        function setNavigationBar() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(Platform.OS === "android")) return [3 /*break*/, 3];
                            return [4 /*yield*/, NavigationBar.setPositionAsync("absolute")];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, NavigationBar.setBackgroundColorAsync("#ffffff00")];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        setNavigationBar();
    }, []);
    useEffect(function () {
        switch (whatTheme) {
            case 0:
                setTheme(scheme === "dark" ? PapillonDark : PapillonLight);
                break;
            case 1:
                setTheme(PapillonLight);
                break;
            default:
                setTheme(PapillonDark);
                break;
        }
    }, [scheme, whatTheme]);
    useEffect(function () {
        var _a, _b, _c;
        setPrimaryColor(((_c = (_b = (_a = account === null || account === void 0 ? void 0 : account.personalization) === null || _a === void 0 ? void 0 : _a.color) === null || _b === void 0 ? void 0 : _b.hex) === null || _c === void 0 ? void 0 : _c.primary) || theme.colors.primary);
    }, [account === null || account === void 0 ? void 0 : account.personalization, theme.colors.primary]);
    var prefix = Linking.createURL("/");
    var linking = {
        prefixes: [prefix],
        config: {
            screens: {
                PronoteManualURL: "url",
                DevMenu: "dev",
            },
        },
    };
    return (<View style={{ flex: 1, backgroundColor: scheme === "dark" ? "#151515" : "#fff" }}>
      {Platform.OS === "android" && (<StatusBar backgroundColor="transparent" translucent barStyle={whatTheme === 0
                ? scheme === "dark"
                    ? "light-content"
                    : "dark-content"
                : whatTheme === 1
                    ? "dark-content"
                    : "light-content"}/>)}
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer linking={linking} theme={__assign(__assign({}, theme), { colors: __assign(__assign({}, theme.colors), { primary: primaryColor }) })} ref={PapillonNavigation} onStateChange={function (state) {
            var str = "";
            var view = state;
            while (view === null || view === void 0 ? void 0 : view.routes) {
                str += "/" + view.routes[view.index].name;
                // @ts-ignore
                view = view.routes[view.index].state;
            }
            navigate(str);
        }}>
            <AlertProvider>
              <Stack.Navigator initialRouteName="AccountSelector" screenOptions={navigatorScreenOptions}>
                {screens.map(function (screen) { return (
        // @ts-ignore
        <Stack.Screen key={screen.name} {...screen}/>); })}
              </Stack.Navigator>
            </AlertProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>);
};
export default Router;
