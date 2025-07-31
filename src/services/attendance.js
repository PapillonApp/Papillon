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
import { useAttendanceStore } from "@/stores/attendance";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error, log } from "@/utils/logger/logger";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { getFeatureAccount } from "@/utils/multiservice";
export function updateAttendancePeriodsInCache(account) {
    return __awaiter(this, void 0, void 0, function () {
        var periods, defaultPeriod, _a, getAttendancePeriods, output, saveIUTLanPeriods, data, getPeriod, output, service;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    periods = [];
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 3];
                        case AccountService.Local: return [3 /*break*/, 4];
                        case AccountService.Skolengo: return [3 /*break*/, 8];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 12];
                case 1: return [4 /*yield*/, import("./pronote/attendance")];
                case 2:
                    getAttendancePeriods = (_b.sent()).getAttendancePeriods;
                    output = getAttendancePeriods(account);
                    periods = output.periods;
                    defaultPeriod = output.default;
                    return [3 /*break*/, 13];
                case 3:
                    {
                        periods = [
                            {
                                name: "Toutes",
                                startTimestamp: new Date("2024-09-28").getTime(),
                                endTimestamp: new Date("2024-09-28").getTime(),
                            },
                        ];
                        defaultPeriod = "Toutes";
                        return [3 /*break*/, 13];
                    }
                    _b.label = 4;
                case 4:
                    if (!(account.identityProvider.identifier == "iut-lannion")) return [3 /*break*/, 7];
                    return [4 /*yield*/, import("./iutlan/grades")];
                case 5:
                    saveIUTLanPeriods = (_b.sent()).saveIUTLanPeriods;
                    return [4 /*yield*/, saveIUTLanPeriods(account)];
                case 6:
                    data = _b.sent();
                    periods = data.periods;
                    defaultPeriod = data.defaultPeriod;
                    return [3 /*break*/, 13];
                case 7:
                    periods = [
                        {
                            name: "Toutes",
                            startTimestamp: 1609459200,
                            endTimestamp: 1622505600,
                        },
                    ];
                    defaultPeriod = "Toutes";
                    return [3 /*break*/, 13];
                case 8: return [4 /*yield*/, import("./skolengo/data/period")];
                case 9:
                    getPeriod = (_b.sent()).getPeriod;
                    return [4 /*yield*/, getPeriod(account)];
                case 10:
                    output = _b.sent();
                    periods = [
                        {
                            name: "Toutes",
                            startTimestamp: Math.min.apply(Math, output.map(function (e) { return e.startTimestamp; })),
                            endTimestamp: Math.max.apply(Math, output.map(function (e) { return e.endTimestamp; })),
                        },
                    ];
                    defaultPeriod = "Toutes";
                    return [3 /*break*/, 13];
                case 11:
                    {
                        service = getFeatureAccount(MultiServiceFeature.Attendance, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"Attendance\"", "multiservice");
                            return [2 /*return*/];
                        }
                        return [2 /*return*/, updateAttendancePeriodsInCache(service)];
                    }
                    _b.label = 12;
                case 12: throw new Error("Service not implemented");
                case 13:
                    useAttendanceStore.getState().updatePeriods(periods, defaultPeriod);
                    return [2 /*return*/];
            }
        });
    });
}
export function updateAttendanceInCache(account, periodName) {
    return __awaiter(this, void 0, void 0, function () {
        var attendance, _a, getAttendance, getAttendance, saveIUTLanAttendance, data, getAttendance, service;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attendance = null;
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                        case AccountService.Local: return [3 /*break*/, 7];
                        case AccountService.Skolengo: return [3 /*break*/, 12];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 16];
                case 1: return [4 /*yield*/, import("./pronote/attendance")];
                case 2:
                    getAttendance = (_b.sent()).getAttendance;
                    return [4 /*yield*/, getAttendance(account, periodName)];
                case 3:
                    attendance = _b.sent();
                    return [3 /*break*/, 17];
                case 4: return [4 /*yield*/, import("./ecoledirecte/attendance")];
                case 5:
                    getAttendance = (_b.sent()).getAttendance;
                    return [4 /*yield*/, getAttendance(account)];
                case 6:
                    attendance = _b.sent();
                    return [3 /*break*/, 17];
                case 7:
                    if (!(account.identityProvider.identifier == "iut-lannion")) return [3 /*break*/, 10];
                    return [4 /*yield*/, import("./iutlan/attendance")];
                case 8:
                    saveIUTLanAttendance = (_b.sent()).saveIUTLanAttendance;
                    return [4 /*yield*/, saveIUTLanAttendance(account, periodName)];
                case 9:
                    data = _b.sent();
                    attendance = {
                        delays: data.delays,
                        absences: data.absences,
                        punishments: data.punishments,
                        observations: data.observations
                    };
                    return [3 /*break*/, 11];
                case 10:
                    attendance = {
                        delays: [],
                        absences: [],
                        punishments: [],
                        observations: []
                    };
                    _b.label = 11;
                case 11: return [3 /*break*/, 17];
                case 12:
                    if (!checkIfSkoSupported(account, "Attendance")) {
                        error("[updateAttendanceInCache]: This Skolengo instance doesn't support Homeworks.", "skolengo");
                        return [3 /*break*/, 17];
                    }
                    return [4 /*yield*/, import("./skolengo/data/attendance")];
                case 13:
                    getAttendance = (_b.sent()).getAttendance;
                    return [4 /*yield*/, getAttendance(account)];
                case 14:
                    attendance = _b.sent();
                    return [3 /*break*/, 17];
                case 15:
                    {
                        service = getFeatureAccount(MultiServiceFeature.Attendance, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"Attendance\"", "multiservice");
                            attendance = {
                                delays: [],
                                absences: [],
                                punishments: [],
                                observations: []
                            };
                            return [3 /*break*/, 17];
                        }
                        return [2 /*return*/, updateAttendanceInCache(service, periodName)];
                    }
                    _b.label = 16;
                case 16: throw new Error("Service not implemented");
                case 17:
                    if (attendance)
                        useAttendanceStore.getState().updateAttendance(periodName, attendance);
                    return [2 /*return*/];
            }
        });
    });
}
