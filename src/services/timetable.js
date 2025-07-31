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
import { AccountService } from "@/stores/account/types";
import { useTimetableStore } from "@/stores/timetable";
import { epochWNToPronoteWN, weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error, log } from "@/utils/logger/logger";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { getFeatureAccount } from "@/utils/multiservice";
/**
 * Updates the state and cache for the timetable of given week number.
 */
export function updateTimetableForWeekInCache(account_1, epochWeekNumber_1) {
    return __awaiter(this, arguments, void 0, function (account, epochWeekNumber, force) {
        var _a, getTimetableForWeek, weekNumber, timetable, getTimetableForWeek, timetable, getTimetableForWeek, rangeDate, timetable, getTimetableForWeek, timetable, service;
        if (force === void 0) { force = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.Local: return [3 /*break*/, 4];
                        case AccountService.Skolengo: return [3 /*break*/, 5];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 8];
                        case AccountService.Multi: return [3 /*break*/, 11];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 14];
                    }
                    return [3 /*break*/, 15];
                case 1: return [4 /*yield*/, import("./pronote/timetable")];
                case 2:
                    getTimetableForWeek = (_b.sent()).getTimetableForWeek;
                    weekNumber = epochWNToPronoteWN(epochWeekNumber, account);
                    return [4 /*yield*/, getTimetableForWeek(account, weekNumber)];
                case 3:
                    timetable = _b.sent();
                    useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
                    return [3 /*break*/, 16];
                case 4:
                    {
                        useTimetableStore.getState().updateClasses(epochWeekNumber, []);
                        return [3 /*break*/, 16];
                    }
                    _b.label = 5;
                case 5:
                    if (!checkIfSkoSupported(account, "Lessons")) {
                        error("[updateTimetableForWeekInCache]: This Skolengo instance doesn't support Lessons.", "skolengo");
                        return [3 /*break*/, 16];
                    }
                    return [4 /*yield*/, import("./skolengo/data/timetable")];
                case 6:
                    getTimetableForWeek = (_b.sent()).getTimetableForWeek;
                    return [4 /*yield*/, getTimetableForWeek(account, epochWeekNumber)];
                case 7:
                    timetable = _b.sent();
                    useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
                    return [3 /*break*/, 16];
                case 8: return [4 /*yield*/, import("./ecoledirecte/timetable")];
                case 9:
                    getTimetableForWeek = (_b.sent()).getTimetableForWeek;
                    rangeDate = weekNumberToDateRange(epochWeekNumber);
                    return [4 /*yield*/, getTimetableForWeek(account, rangeDate)];
                case 10:
                    timetable = _b.sent();
                    useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
                    return [3 /*break*/, 16];
                case 11: return [4 /*yield*/, import("./multi/data/timetable")];
                case 12:
                    getTimetableForWeek = (_b.sent()).getTimetableForWeek;
                    return [4 /*yield*/, getTimetableForWeek(account, epochWeekNumber)];
                case 13:
                    timetable = _b.sent();
                    useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
                    return [3 /*break*/, 16];
                case 14:
                    {
                        service = getFeatureAccount(MultiServiceFeature.Timetable, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"Timetable\"", "multiservice");
                            return [3 /*break*/, 16];
                        }
                        return [2 /*return*/, updateTimetableForWeekInCache(service, epochWeekNumber, force)];
                    }
                    _b.label = 15;
                case 15:
                    {
                        throw new Error("Service not implemented.");
                    }
                    _b.label = 16;
                case 16: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the week "frequency" object for the given week number.
 *
 * @example "Q1"/"Q2", "S1"/"S2"
 */
export function getWeekFrequency(account, epochWeekNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getWeekFrequency_1, weekNumber;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, import("./pronote/timetable")];
                case 2:
                    getWeekFrequency_1 = (_b.sent()).getWeekFrequency;
                    weekNumber = epochWNToPronoteWN(epochWeekNumber, account);
                    return [2 /*return*/, getWeekFrequency_1(account, weekNumber)];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
export function getCourseRessources(account, course) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getCourseRessources_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 4];
                case 1: return [4 /*yield*/, import("./pronote/timetable")];
                case 2:
                    getCourseRessources_1 = (_b.sent()).getCourseRessources;
                    return [4 /*yield*/, getCourseRessources_1(account, course)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4: return [2 /*return*/, []];
            }
        });
    });
}
