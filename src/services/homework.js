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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { AccountService } from "@/stores/account/types";
import { useHomeworkStore } from "@/stores/homework";
import { error, log } from "@/utils/logger/logger";
import { translateToWeekNumber } from "pawnote";
import { pronoteFirstDate } from "./pronote/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { useClassSubjectStore } from "@/stores/classSubject";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { getFeatureAccount } from "@/utils/multiservice";
/**
 * Updates the state and cache for the homework of given week number.
 */
export function updateHomeworkForWeekInCache(account, date) {
    return __awaiter(this, void 0, void 0, function () {
        var homeworks, _a, getHomeworkForWeek, weekNumber_1, getHomeworkForWeek, weekNumber_2, getHomeworkForWeek, weekNumber_3, response, service, weekNumber, existingHomeworks, mergedHomeworks, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    homeworks = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 15, , 16]);
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 2];
                        case AccountService.Skolengo: return [3 /*break*/, 5];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 8];
                        case AccountService.Local: return [3 /*break*/, 11];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 13];
                case 2: return [4 /*yield*/, import("./pronote/homework")];
                case 3:
                    getHomeworkForWeek = (_c.sent()).getHomeworkForWeek;
                    weekNumber_1 = translateToWeekNumber(date, ((_b = account.instance) === null || _b === void 0 ? void 0 : _b.instance.firstMonday) || pronoteFirstDate);
                    return [4 /*yield*/, getHomeworkForWeek(account, weekNumber_1)];
                case 4:
                    homeworks = _c.sent();
                    return [3 /*break*/, 14];
                case 5:
                    if (!checkIfSkoSupported(account, "Homeworks")) {
                        error("[updateHomeworkForWeekInCache]: This Skolengo instance doesn't support Homeworks.", "skolengo");
                        return [3 /*break*/, 14];
                    }
                    return [4 /*yield*/, import("./skolengo/data/homework")];
                case 6:
                    getHomeworkForWeek = (_c.sent()).getHomeworkForWeek;
                    weekNumber_2 = dateToEpochWeekNumber(date);
                    return [4 /*yield*/, getHomeworkForWeek(account, weekNumber_2)];
                case 7:
                    homeworks = _c.sent();
                    return [3 /*break*/, 14];
                case 8: return [4 /*yield*/, import("./ecoledirecte/homework")];
                case 9:
                    getHomeworkForWeek = (_c.sent()).getHomeworkForWeek;
                    weekNumber_3 = dateToEpochWeekNumber(date);
                    return [4 /*yield*/, getHomeworkForWeek(account, weekNumber_3)];
                case 10:
                    response = _c.sent();
                    homeworks = response.homework;
                    useClassSubjectStore.getState().pushSubjects(response.subjects);
                    return [3 /*break*/, 14];
                case 11:
                    {
                        homeworks = [];
                        return [3 /*break*/, 14];
                    }
                    _c.label = 12;
                case 12:
                    {
                        service = getFeatureAccount(MultiServiceFeature.Homeworks, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"Homeworks\"", "multiservice");
                            return [3 /*break*/, 14];
                        }
                        return [2 /*return*/, updateHomeworkForWeekInCache(service, date)];
                    }
                    _c.label = 13;
                case 13:
                    console.info("[updateHomeworkForWeekInCache]: updating to empty since ".concat(account.service, " not implemented."));
                    _c.label = 14;
                case 14:
                    weekNumber = dateToEpochWeekNumber(date);
                    existingHomeworks = (useHomeworkStore.getState().homeworks[weekNumber] || []).filter(function (element) { return element.personalizate; });
                    mergedHomeworks = __spreadArray(__spreadArray([], homeworks, true), existingHomeworks.filter(function (customHomework) { return !homeworks.some(function (hw) { return hw.id === customHomework.id; }); }), true);
                    useHomeworkStore.getState().updateHomeworks(weekNumber, mergedHomeworks);
                    return [3 /*break*/, 16];
                case 15:
                    err_1 = _c.sent();
                    error("homeworks not updated, see:".concat(err_1), "updateHomeworkForWeekInCache");
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
export function toggleHomeworkState(account, homework) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, toggleHomeworkState_1, toggleHomeworkState_2, service;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                        case AccountService.Local: return [3 /*break*/, 7];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, import("./pronote/homework")];
                case 2:
                    toggleHomeworkState_1 = (_b.sent()).toggleHomeworkState;
                    return [4 /*yield*/, toggleHomeworkState_1(account, homework)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 4: return [4 /*yield*/, import("./ecoledirecte/homework")];
                case 5:
                    toggleHomeworkState_2 = (_b.sent()).toggleHomeworkState;
                    return [4 /*yield*/, toggleHomeworkState_2(account, homework)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 7:
                    {
                        return [3 /*break*/, 10];
                    }
                    _b.label = 8;
                case 8:
                    {
                        service = getFeatureAccount(MultiServiceFeature.Homeworks, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"Homeworks\"", "multiservice");
                            return [3 /*break*/, 10];
                        }
                        return [2 /*return*/, toggleHomeworkState(service, homework)];
                    }
                    _b.label = 9;
                case 9:
                    {
                        throw new Error("Service not implemented");
                    }
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
