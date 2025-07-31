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
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import { fetchNews } from "./data/News";
import { log, error, warn, info } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
import { fetchLessons } from "./data/Lessons";
import { fetchAttendance } from "./data/Attendance";
import { fetchEvaluation } from "./data/Evaluation";
import { papillonNotify } from "./Notifications";
import { useFlagsStore } from "@/stores/flags";
var isBackgroundFetchRunning = false;
var BACKGROUND_TASK_NAME = "background-fetch";
var fetch = function (label, fn) { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                info("\u25B6\uFE0F Running background ".concat(label), "BACKGROUND");
                return [4 /*yield*/, fn()];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                error("\u274C ".concat(label, " fetch failed: ").concat(e_1), "BACKGROUND");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var backgroundFetch = function () { return __awaiter(void 0, void 0, void 0, function () {
    var disableBackgroundTasks, notifee, accounts, switchTo, primaryAccounts, _i, primaryAccounts_1, account, notificationsTypesPermissions, ERRfatal_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                disableBackgroundTasks = useFlagsStore.getState().defined("disablebackgroundtasks");
                if (disableBackgroundTasks) {
                    warn("⚠️ Background fetch disabled by flags.", "BACKGROUND");
                    return [2 /*return*/, BackgroundFetchResult.NoData];
                }
                return [4 /*yield*/, import("@notifee/react-native")];
            case 1:
                notifee = (_a.sent()).default;
                if (isBackgroundFetchRunning) {
                    warn("⚠️ Background fetch already running. Skipping...", "BACKGROUND");
                    return [2 /*return*/, BackgroundFetchResult.NoData];
                }
                isBackgroundFetchRunning = true;
                if (!__DEV__) return [3 /*break*/, 3];
                return [4 /*yield*/, papillonNotify({
                        id: "statusBackground",
                        body: "Récupération des données des comptes les plus récentes en arrière-plan...",
                        android: {
                            progress: {
                                indeterminate: true,
                            },
                        },
                    }, "Status")];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 14, 15, 16]);
                accounts = getAccounts();
                switchTo = getSwitchToFunction();
                primaryAccounts = accounts.filter(function (account) { return !account.isExternal; });
                _i = 0, primaryAccounts_1 = primaryAccounts;
                _a.label = 4;
            case 4:
                if (!(_i < primaryAccounts_1.length)) return [3 /*break*/, 13];
                account = primaryAccounts_1[_i];
                return [4 /*yield*/, switchTo(account)];
            case 5:
                _a.sent();
                notificationsTypesPermissions = account.personalization.notifications;
                if (!(notificationsTypesPermissions === null || notificationsTypesPermissions === void 0 ? void 0 : notificationsTypesPermissions.enabled)) return [3 /*break*/, 12];
                return [4 /*yield*/, fetch("News", fetchNews)];
            case 6:
                _a.sent();
                return [4 /*yield*/, fetch("Homeworks", fetchHomeworks)];
            case 7:
                _a.sent();
                return [4 /*yield*/, fetch("Grades", fetchGrade)];
            case 8:
                _a.sent();
                return [4 /*yield*/, fetch("Lessons", fetchLessons)];
            case 9:
                _a.sent();
                return [4 /*yield*/, fetch("Attendance", fetchAttendance)];
            case 10:
                _a.sent();
                return [4 /*yield*/, fetch("Evaluation", fetchEvaluation)];
            case 11:
                _a.sent();
                _a.label = 12;
            case 12:
                _i++;
                return [3 /*break*/, 4];
            case 13:
                log("✅ Finish background fetch", "BACKGROUND");
                return [2 /*return*/, BackgroundFetchResult.NewData];
            case 14:
                ERRfatal_1 = _a.sent();
                error("\u274C Task failed: ".concat(ERRfatal_1), "BACKGROUND");
                return [2 /*return*/, BackgroundFetchResult.Failed];
            case 15:
                isBackgroundFetchRunning = false;
                if (__DEV__) {
                    notifee.cancelNotification("statusBackground");
                }
                return [7 /*endfinally*/];
            case 16: return [2 /*return*/];
        }
    });
}); };
if (!isExpoGo())
    TaskManager.defineTask(BACKGROUND_TASK_NAME, backgroundFetch);
var unsetBackgroundFetch = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
var setBackgroundFetch = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
                    minimumInterval: 60 * (__DEV__ ? 1 : 15),
                    stopOnTerminate: false,
                    startOnBoot: true,
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var registerBackgroundTasks = function () { return __awaiter(void 0, void 0, void 0, function () {
    var disableBackgroundTasks, isRegistered;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                disableBackgroundTasks = useFlagsStore.getState().defined("disablebackgroundtasks");
                if (!disableBackgroundTasks) return [3 /*break*/, 2];
                warn("⚠️ Background tasks registration skipped because disabled by flag.", "BACKGROUND");
                return [4 /*yield*/, unsetBackgroundFetch()
                        .then(function () { return log("✅ Background task unregistered (flag)", "BACKGROUND"); })
                        .catch(function (ERRfatal) {
                        return error("\u274C Failed to unregister background task (flag): ".concat(ERRfatal), "BACKGROUND");
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
            case 2: return [4 /*yield*/, TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)];
            case 3:
                isRegistered = _a.sent();
                if (!isRegistered) return [3 /*break*/, 5];
                info("⚠️ Background task already registered. Unregister background task...", "BACKGROUND");
                return [4 /*yield*/, unsetBackgroundFetch()
                        .then(function () { return log("✅ Background task unregistered", "BACKGROUND"); })
                        .catch(function (ERRfatal) {
                        return error("\u274C Failed to unregister background task: ".concat(ERRfatal), "BACKGROUND");
                    })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, setBackgroundFetch()
                    .then(function () { return log("✅ Background task registered", "BACKGROUND"); })
                    .catch(function (ERRfatal) {
                    return error("\u274C Failed to register background task: ".concat(ERRfatal), "BACKGROUND");
                })];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
export { registerBackgroundTasks, unsetBackgroundFetch };
