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
var _a;
import "@/background/BackgroundTasks";
import Router from "@/router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox, AppState } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import { atobPolyfill, btoaPolyfill } from "js-base64";
import { registerBackgroundTasks } from "@/background/BackgroundTasks";
import { SoundHapticsProvider } from "@/hooks/Theme_Sound_Haptics";
import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";
import { getToLoadFonts } from "@/consts/Fonts";
import { useFlagsStore } from "@/stores/flags";
SplashScreen.preventAutoHideAsync();
var DEFAULT_BACKGROUND_TIME = 15 * 60 * 1000; // 15 minutes
var BACKGROUND_LIMITS = (_a = {},
    _a[AccountService.EcoleDirecte] = 15 * 60 * 1000,
    _a[AccountService.Pronote] = 5 * 60 * 1000,
    _a[AccountService.Skolengo] = 60 * 60 * 1000,
    _a);
export default function App() {
    var _this = this;
    var _a = useState(AppState.currentState), appState = _a[0], setAppState = _a[1];
    var currentAccount = useCurrentAccount(function (store) { return store.account; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var accounts = useAccounts(function (store) { return store.accounts; }).filter(function (account) { return !account.isExternal; });
    var defined = useFlagsStore(function (state) { return state.defined; });
    var fontsLoaded = useFonts(getToLoadFonts(defined))[0];
    useEffect(function () {
        var configureOrientation = function () { return __awaiter(_this, void 0, void 0, function () {
            var deviceType, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 8]);
                        return [4 /*yield*/, Device.getDeviceTypeAsync()];
                    case 1:
                        deviceType = _a.sent();
                        if (!(deviceType === Device.DeviceType.TABLET)) return [3 /*break*/, 3];
                        return [4 /*yield*/, ScreenOrientation.unlockAsync()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_1 = _a.sent();
                        log("Error during orientation lock: ".concat(error_1), "Orientation/App");
                        return [4 /*yield*/, ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        configureOrientation();
    }, []);
    var getBackgroundTimeLimit = useCallback(function (service) {
        var _a;
        return (_a = BACKGROUND_LIMITS[service]) !== null && _a !== void 0 ? _a : DEFAULT_BACKGROUND_TIME;
    }, []);
    var handleBackgroundState = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var savedTimestamp, timeInBackground, timeLimit, timeInBackgroundSeconds, _i, accounts_1, account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AsyncStorage.getItem("@background_timestamp")];
                case 1:
                    savedTimestamp = _a.sent();
                    if (!savedTimestamp || !currentAccount)
                        return [2 /*return*/];
                    timeInBackground = Date.now() - parseInt(savedTimestamp, 10);
                    timeLimit = currentAccount.service in BACKGROUND_LIMITS
                        ? getBackgroundTimeLimit(currentAccount.service)
                        : DEFAULT_BACKGROUND_TIME;
                    timeInBackgroundSeconds = Math.floor(timeInBackground / 1000);
                    if (!(timeInBackground >= timeLimit)) return [3 /*break*/, 7];
                    log("\u26A0\uFE0F Refreshing current account ".concat(currentAccount.studentName.first, " after ").concat(timeInBackgroundSeconds, "s in background"), "RefreshToken");
                    _i = 0, accounts_1 = accounts;
                    _a.label = 2;
                case 2:
                    if (!(_i < accounts_1.length)) return [3 /*break*/, 5];
                    account = accounts_1[_i];
                    if (!(account.localID === currentAccount.localID)) return [3 /*break*/, 4];
                    return [4 /*yield*/, switchTo(account).catch(function (error) {
                            log("Error during switchTo: ".concat(error), "RefreshToken");
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [4 /*yield*/, AsyncStorage.removeItem("@background_timestamp")];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [currentAccount, switchTo, getBackgroundTimeLimit]);
    useEffect(function () {
        var subscription = AppState.addEventListener("change", function (nextAppState) { return __awaiter(_this, void 0, void 0, function () {
            var notifee, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (appState === nextAppState)
                            return [2 /*return*/];
                        if (!(nextAppState === "active")) return [3 /*break*/, 6];
                        if (!!isExpoGo()) return [3 /*break*/, 4];
                        return [4 /*yield*/, import("@notifee/react-native")];
                    case 1:
                        notifee = (_a.sent()).default;
                        return [4 /*yield*/, notifee.setBadgeCount(0)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, notifee.cancelAllNotifications()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, handleBackgroundState()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        if (!nextAppState.match(/inactive|background/)) return [3 /*break*/, 8];
                        now = Date.now();
                        return [4 /*yield*/, AsyncStorage.setItem("@background_timestamp", now.toString())];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        setAppState(nextAppState);
                        return [2 /*return*/];
                }
            });
        }); });
        return function () { return subscription.remove(); };
    }, [appState, handleBackgroundState]);
    useEffect(function () {
        LogBox.ignoreLogs([
            "[react-native-gesture-handler]",
            "VirtualizedLists should never be nested",
            "TNodeChildrenRenderer: Support for defaultProps",
            "Service not implemented",
            "Linking found multiple possible",
            "[Reanimated] Property ",
        ]);
        if (!isExpoGo())
            registerBackgroundTasks();
        var encoding = require("text-encoding");
        Object.assign(global, {
            TextDecoder: encoding.TextDecoder,
            TextEncoder: encoding.TextEncoder,
            atob: atobPolyfill,
            btoa: btoaPolyfill,
        });
    }, []);
    if (!fontsLoaded)
        return null;
    return (<SoundHapticsProvider>
      <Router />
    </SoundHapticsProvider>);
}
