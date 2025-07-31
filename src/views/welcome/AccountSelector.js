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
import { useAccounts, useCurrentAccount } from "@/stores/account";
import React, { useEffect } from "react";
import { Image, useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { PapillonNavigation } from "@/router/refs";
import { isExpoGo } from "@/utils/native/expoGoAlert";
var AccountSelector = function (_a) {
    var navigation = _a.navigation;
    var colorScheme = useColorScheme();
    var accounts = useAccounts(function (store) { return store.accounts; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var lastOpenedAccountID = useAccounts(function (store) { return store.lastOpenedAccountID; });
    var checkInitialNotification = function () { return __awaiter(void 0, void 0, void 0, function () {
        var notifee, initialNotification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, import("@notifee/react-native")];
                case 1:
                    notifee = (_a.sent()).default;
                    return [4 /*yield*/, notifee.getInitialNotification()];
                case 2:
                    initialNotification = _a.sent();
                    if (!initialNotification) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleNotificationPress(initialNotification.notification)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    connectToAccount();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleNotificationPress = function (notification) { return __awaiter(void 0, void 0, void 0, function () {
        var accountID_1, account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(notification === null || notification === void 0 ? void 0 : notification.data)) return [3 /*break*/, 2];
                    accountID_1 = notification.data.accountID;
                    if (!accountID_1) return [3 /*break*/, 2];
                    account = accounts.find(function (account) { return account.localID === accountID_1; });
                    if (!account) return [3 /*break*/, 2];
                    return [4 /*yield*/, switchTo(account)];
                case 1:
                    _a.sent();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountStack" }],
                    });
                    setTimeout(function () {
                        var _a;
                        (_a = PapillonNavigation.current) === null || _a === void 0 ? void 0 : _a.navigate(notification.data.page, notification.data.parameters);
                    }, 1000);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var connectToAccount = function () { return __awaiter(void 0, void 0, void 0, function () {
        var selectedAccount;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!useAccounts.persist.hasHydrated())
                        return [2 /*return*/];
                    // If there are no accounts, redirect the user to the first installation page.
                    if (accounts.filter(function (account) { return !account.isExternal; }).length === 0) {
                        // Use the `reset` method to clear the navigation stack.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "FirstInstallation" }],
                        });
                        SplashScreen.hideAsync();
                    }
                    selectedAccount = (_a = accounts.find(function (account) { return account.localID === lastOpenedAccountID; })) !== null && _a !== void 0 ? _a : accounts.find(function (account) { return !account.isExternal; });
                    return [4 /*yield*/, switchTo(selectedAccount)];
                case 1:
                    _b.sent();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountStack" }],
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        if (!isExpoGo()) {
            checkInitialNotification();
        }
        else {
            connectToAccount();
        }
    }, []);
    return (<Image source={colorScheme === "dark" ? require("../../../assets/launch/splash-dark.png") : require("../../../assets/launch/splash.png")} resizeMode="cover" style={{ flex: 1 }}/>);
};
export default AccountSelector;
