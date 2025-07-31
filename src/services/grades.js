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
import { useGradesStore } from "@/stores/grades";
import { error, log } from "@/utils/logger/logger";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { getFeatureAccount } from "@/utils/multiservice";
var getDefaultPeriod = function (periods) {
    var now = Date.now();
    var currentPeriod = periods.find(function (p) { return p.startTimestamp && p.endTimestamp && p.startTimestamp <= now && p.endTimestamp >= now; }) || periods.at(0);
    return currentPeriod.name;
};
export function updateGradesPeriodsInCache(account) {
    return __awaiter(this, void 0, void 0, function () {
        var periods, defaultPeriod, _a, getGradesPeriods, output, getGradesPeriods, saveIUTLanPeriods, data, getPeriod, service;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    periods = [];
                    defaultPeriod = null;
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 3];
                        case AccountService.Local: return [3 /*break*/, 6];
                        case AccountService.Skolengo: return [3 /*break*/, 10];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 15];
                case 1: return [4 /*yield*/, import("./pronote/grades")];
                case 2:
                    getGradesPeriods = (_b.sent()).getGradesPeriods;
                    output = getGradesPeriods(account);
                    periods = output.periods;
                    defaultPeriod = output.default;
                    return [3 /*break*/, 16];
                case 3: return [4 /*yield*/, import("./ecoledirecte/grades")];
                case 4:
                    getGradesPeriods = (_b.sent()).getGradesPeriods;
                    return [4 /*yield*/, getGradesPeriods(account)];
                case 5:
                    periods = _b.sent();
                    defaultPeriod = getDefaultPeriod(periods);
                    return [3 /*break*/, 16];
                case 6:
                    if (!(account.identityProvider.identifier == "iut-lannion")) return [3 /*break*/, 9];
                    return [4 /*yield*/, import("./iutlan/grades")];
                case 7:
                    saveIUTLanPeriods = (_b.sent()).saveIUTLanPeriods;
                    return [4 /*yield*/, saveIUTLanPeriods(account)];
                case 8:
                    data = _b.sent();
                    periods = data.periods;
                    defaultPeriod = data.defaultPeriod;
                    return [3 /*break*/, 16];
                case 9:
                    periods = [
                        {
                            name: "Toutes",
                            startTimestamp: 1609459200,
                            endTimestamp: 1622505600
                        },
                    ];
                    defaultPeriod = "Toutes";
                    return [3 /*break*/, 16];
                case 10:
                    if (!checkIfSkoSupported(account, "Grades")) {
                        error("[updateGradesPeriodsInCache]: This Skolengo instance doesn't support Grades.", "skolengo");
                        return [3 /*break*/, 16];
                    }
                    return [4 /*yield*/, import("./skolengo/data/period")];
                case 11:
                    getPeriod = (_b.sent()).getPeriod;
                    return [4 /*yield*/, getPeriod(account)];
                case 12:
                    periods = _b.sent();
                    defaultPeriod = getDefaultPeriod(periods);
                    return [3 /*break*/, 16];
                case 13:
                    service = getFeatureAccount(MultiServiceFeature.Grades, account.localID);
                    if (!service) {
                        log("No service set in multi-service space for feature \"Grades\"", "multiservice");
                        return [3 /*break*/, 16];
                    }
                    return [4 /*yield*/, updateGradesPeriodsInCache(service)];
                case 14: return [2 /*return*/, _b.sent()];
                case 15: throw new Error("Service not implemented");
                case 16:
                    if (periods.length === 0)
                        return [2 /*return*/];
                    if (!defaultPeriod)
                        defaultPeriod = getDefaultPeriod(periods);
                    useGradesStore.getState().updatePeriods(periods, defaultPeriod);
                    return [2 /*return*/];
            }
        });
    });
}
export function updateGradesAndAveragesInCache(account, periodName) {
    return __awaiter(this, void 0, void 0, function () {
        var grades, averages, _a, getGradesAndAverages, output, getGradesAndAverages, output, saveIUTLanGrades, data, getGradesAndAverages, output, service, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    grades = [];
                    averages = {
                        subjects: [],
                        overall: { value: null, disabled: true, status: null },
                        classOverall: { value: null, disabled: true, status: null }
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 20, , 21]);
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 2];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 5];
                        case AccountService.Local: return [3 /*break*/, 8];
                        case AccountService.Skolengo: return [3 /*break*/, 13];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 16];
                    }
                    return [3 /*break*/, 18];
                case 2: return [4 /*yield*/, import("./pronote/grades")];
                case 3:
                    getGradesAndAverages = (_b.sent()).getGradesAndAverages;
                    return [4 /*yield*/, getGradesAndAverages(account, periodName)];
                case 4:
                    output = _b.sent();
                    grades = output.grades;
                    averages = output.averages;
                    return [3 /*break*/, 19];
                case 5: return [4 /*yield*/, import("./ecoledirecte/grades")];
                case 6:
                    getGradesAndAverages = (_b.sent()).getGradesAndAverages;
                    return [4 /*yield*/, getGradesAndAverages(account, periodName)];
                case 7:
                    output = _b.sent();
                    grades = output.grades;
                    averages = output.averages;
                    return [3 /*break*/, 19];
                case 8:
                    if (!(account.identityProvider.identifier == "iut-lannion")) return [3 /*break*/, 11];
                    return [4 /*yield*/, import("./iutlan/grades")];
                case 9:
                    saveIUTLanGrades = (_b.sent()).saveIUTLanGrades;
                    return [4 /*yield*/, saveIUTLanGrades(account, periodName)];
                case 10:
                    data = _b.sent();
                    grades = data.grades;
                    averages = data.averages;
                    return [3 /*break*/, 12];
                case 11:
                    grades = [];
                    averages = {
                        subjects: [],
                        overall: { value: 0, disabled: true, status: null },
                        classOverall: { value: 0, disabled: true, status: null }
                    };
                    _b.label = 12;
                case 12: return [3 /*break*/, 19];
                case 13:
                    if (!checkIfSkoSupported(account, "Grades")) {
                        error("[updateGradesAndAveragesInCache]: This Skolengo instance doesn't support Grades.", "skolengo");
                        return [3 /*break*/, 19];
                    }
                    return [4 /*yield*/, import("./skolengo/data/grades")];
                case 14:
                    getGradesAndAverages = (_b.sent()).getGradesAndAverages;
                    return [4 /*yield*/, getGradesAndAverages(account, periodName)];
                case 15:
                    output = _b.sent();
                    grades = output.grades;
                    averages = output.averages;
                    return [3 /*break*/, 19];
                case 16:
                    service = getFeatureAccount(MultiServiceFeature.Grades, account.localID);
                    if (!service) {
                        log("No service set in multi-service space for feature \"Grades\"", "multiservice");
                        return [3 /*break*/, 19];
                    }
                    return [4 /*yield*/, updateGradesAndAveragesInCache(service, periodName)];
                case 17: return [2 /*return*/, _b.sent()];
                case 18: throw new Error("Service (".concat(AccountService[account.service], ") not implemented for this request"));
                case 19:
                    useGradesStore.getState().updateGradesAndAverages(periodName, grades, averages);
                    return [3 /*break*/, 21];
                case 20:
                    err_1 = _b.sent();
                    error("grades not updated, see:".concat(err_1), "updateGradesAndAveragesInCache");
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    });
}
