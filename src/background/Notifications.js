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
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { Platform } from "react-native";
var requestNotificationPermission = function (showAlert) { return __awaiter(void 0, void 0, void 0, function () {
    var notifee, AuthorizationStatus, settings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!isExpoGo()) return [3 /*break*/, 4];
                return [4 /*yield*/, import("@notifee/react-native")];
            case 1:
                notifee = (_a.sent()).default;
                return [4 /*yield*/, import("@notifee/react-native")];
            case 2:
                AuthorizationStatus = (_a.sent()).AuthorizationStatus;
                return [4 /*yield*/, notifee.requestPermission()];
            case 3:
                settings = _a.sent();
                if (Platform.OS === "ios") {
                    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                }
                else {
                    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                }
                return [3 /*break*/, 5];
            case 4:
                alertExpoGo(showAlert);
                return [2 /*return*/, undefined];
            case 5: return [2 /*return*/];
        }
    });
}); };
var createChannelNotification = function () { return __awaiter(void 0, void 0, void 0, function () {
    var notifee, AndroidImportance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, import("@notifee/react-native")];
            case 1:
                notifee = (_a.sent()).default;
                return [4 /*yield*/, import("@notifee/react-native")];
            case 2:
                AndroidImportance = (_a.sent()).AndroidImportance;
                return [4 /*yield*/, notifee.createChannel({
                        id: "Test",
                        name: "Test",
                        description: "Permet de tester les notifications",
                        sound: "default",
                    })];
            case 3:
                _a.sent();
                if (!__DEV__) return [3 /*break*/, 5];
                return [4 /*yield*/, notifee.createChannel({
                        id: "Status",
                        name: "Statut du background",
                        description: "Affiche quand le background est actuellement actif",
                        vibration: false,
                        importance: AndroidImportance.MIN,
                        badge: false,
                    })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, notifee.createChannelGroup({
                    id: "Papillon",
                    name: "Notifications Scolaires",
                    description: "Permet de ne rien rater de ta vie scolaire",
                })];
            case 6:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "News",
                        groupId: "Papillon",
                        name: "Actualités",
                        description: "Te notifie lorsque tu as de nouvelles actualités",
                        sound: "default",
                    })];
            case 7:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "Homeworks",
                        groupId: "Papillon",
                        name: "Nouveau Devoir",
                        description: "Te notifie lorsque tu as de nouveaux devoirs",
                        sound: "default",
                    })];
            case 8:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "Grades",
                        groupId: "Papillon",
                        name: "Notes",
                        description: "Te notifie lorsque tu as de nouvelles notes",
                        sound: "default",
                    })];
            case 9:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "Lessons",
                        groupId: "Papillon",
                        name: "Emploi du temps",
                        description: "Te notifie lorsque ton emploi du temps du jour est modifié",
                        sound: "default",
                    })];
            case 10:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "Attendance",
                        groupId: "Papillon",
                        name: "Vie Scolaire",
                        description: "Te notifie lorsque tu as de nouvelles absences/retards/observations/punitions",
                        sound: "default",
                    })];
            case 11:
                _a.sent();
                return [4 /*yield*/, notifee.createChannel({
                        id: "Evaluation",
                        groupId: "Papillon",
                        name: "Compétences",
                        description: "Te notifie lorsque tu as de nouvelles compétences",
                        sound: "default",
                    })];
            case 12:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var papillonNotify = function (props, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var notifee, AndroidColor, timestamp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, import("@notifee/react-native")];
            case 1:
                notifee = (_a.sent()).default;
                return [4 /*yield*/, import("@notifee/react-native")];
            case 2:
                AndroidColor = (_a.sent()).AndroidColor;
                timestamp = new Date().getTime();
                // Display a notification
                return [4 /*yield*/, notifee.displayNotification(__assign(__assign({}, props), { android: {
                            channelId: channelId,
                            timestamp: timestamp,
                            showTimestamp: channelId !== "Status" ? true : false,
                            showChronometer: channelId === "Status" ? true : false,
                            smallIcon: "@mipmap/ic_launcher_foreground",
                            color: AndroidColor.GREEN,
                            pressAction: {
                                id: "default",
                                launchActivity: "default",
                            }
                        }, ios: {
                            threadId: channelId,
                            sound: channelId !== "Status" ? "default" : "",
                        } }))];
            case 3:
                // Display a notification
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
export { requestNotificationPermission, createChannelNotification, papillonNotify, };
