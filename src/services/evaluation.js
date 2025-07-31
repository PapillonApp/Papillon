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
import { getFeatureAccount } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { useEvaluationStore } from "@/stores/evaluation";
import { error, log } from "@/utils/logger/logger";
var getDefaultPeriod = function (periods) {
    var now = Date.now();
    var currentPeriod = periods.find(function (p) { return p.startTimestamp && p.endTimestamp && p.startTimestamp <= now && p.endTimestamp >= now; }) || periods.at(0);
    return currentPeriod.name;
};
export function updateEvaluationPeriodsInCache(account) {
    return __awaiter(this, void 0, void 0, function () {
        var periods, defaultPeriod, _a, getEvaluationsPeriods, output, service;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    periods = [];
                    defaultPeriod = null;
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 5];
                case 1: return [4 /*yield*/, import("./pronote/evaluations")];
                case 2:
                    getEvaluationsPeriods = (_b.sent()).getEvaluationsPeriods;
                    output = getEvaluationsPeriods(account);
                    periods = output.periods;
                    defaultPeriod = output.default;
                    return [3 /*break*/, 6];
                case 3:
                    service = getFeatureAccount(MultiServiceFeature.Evaluations, account.localID);
                    if (!service) {
                        log("No service set in multi-service space for feature \"Evaluations\"", "multiservice");
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, updateEvaluationPeriodsInCache(service)];
                case 4: return [2 /*return*/, _b.sent()];
                case 5: throw new Error("Service not implemented");
                case 6:
                    if (periods.length === 0)
                        return [2 /*return*/];
                    if (!defaultPeriod)
                        defaultPeriod = getDefaultPeriod(periods);
                    useEvaluationStore.getState().updatePeriods(periods, defaultPeriod);
                    return [2 /*return*/];
            }
        });
    });
}
export function updateEvaluationsInCache(account, periodName) {
    return __awaiter(this, void 0, void 0, function () {
        var evaluations, _a, getEvaluations, service, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    evaluations = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 2];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 2: return [4 /*yield*/, import("./pronote/evaluations")];
                case 3:
                    getEvaluations = (_b.sent()).getEvaluations;
                    return [4 /*yield*/, getEvaluations(account, periodName)];
                case 4:
                    evaluations = _b.sent();
                    return [3 /*break*/, 8];
                case 5:
                    service = getFeatureAccount(MultiServiceFeature.Evaluations, account.localID);
                    if (!service) {
                        log("No service set in multi-service space for feature \"Evaluations\"", "multiservice");
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, updateEvaluationsInCache(service, periodName)];
                case 6: return [2 /*return*/, _b.sent()];
                case 7: throw new Error("Service (".concat(AccountService[account.service], ") not implemented for this request"));
                case 8:
                    useEvaluationStore.getState().updateEvaluations(periodName, evaluations);
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _b.sent();
                    error("evaluations not updated, see:".concat(err_1), "updateGradesAndAveragesInCache");
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
