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
import { AccountService } from "@/stores/account/types";
import { warn } from "@/utils/logger/logger";
/**
 * Takes the service of the account and tries
 * to reload the instance of the service using the "authentication" values stored.
 *
 * Once the instance has been reloaded, we give the new values for further authentications.
 */
export function reload(account) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, reloadInstance, reload_1, auth, reload_2, auth, reload_3, instance, balances, reload_4, instance, reload_5, res, reload_6, res, reloadInstance;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.Local: return [3 /*break*/, 4];
                        case AccountService.Turboself: return [3 /*break*/, 5];
                        case AccountService.Alise: return [3 /*break*/, 8];
                        case AccountService.ARD: return [3 /*break*/, 11];
                        case AccountService.Izly: return [3 /*break*/, 15];
                        case AccountService.Skolengo: return [3 /*break*/, 18];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 21];
                        case AccountService.Multi: return [3 /*break*/, 24];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 27];
                    }
                    return [3 /*break*/, 28];
                case 1: return [4 /*yield*/, import("./pronote/reload-instance")];
                case 2:
                    reloadInstance = (_b.sent()).reloadInstance;
                    return [4 /*yield*/, reloadInstance(account.authentication)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    {
                        return [2 /*return*/, { instance: account.identityProvider.rawData || true, authentication: true }];
                    }
                    _b.label = 5;
                case 5: return [4 /*yield*/, import("./turboself/reload")];
                case 6:
                    reload_1 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_1(account)];
                case 7:
                    auth = _b.sent();
                    // keep instance the same
                    return [2 /*return*/, { instance: undefined, authentication: auth }];
                case 8: return [4 /*yield*/, import("./alise/reload")];
                case 9:
                    reload_2 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_2(account)];
                case 10:
                    auth = _b.sent();
                    return [2 /*return*/, { instance: undefined, authentication: auth }];
                case 11: return [4 /*yield*/, import("./ard/reload")];
                case 12:
                    reload_3 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_3(account)];
                case 13:
                    instance = _b.sent();
                    return [4 /*yield*/, instance.getOnlinePayments()];
                case 14:
                    balances = _b.sent();
                    return [2 /*return*/, {
                            instance: instance,
                            authentication: __assign(__assign({}, account.authentication), { balances: balances })
                        }];
                case 15: return [4 /*yield*/, import("./izly/reload")];
                case 16:
                    reload_4 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_4(account)];
                case 17:
                    instance = _b.sent();
                    return [2 /*return*/, { instance: instance, authentication: account.authentication }];
                case 18: return [4 /*yield*/, import("./skolengo/reload-skolengo")];
                case 19:
                    reload_5 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_5(account)];
                case 20:
                    res = _b.sent();
                    return [2 /*return*/, { instance: res.instance, authentication: res.authentication }];
                case 21: return [4 /*yield*/, import("./ecoledirecte/reload")];
                case 22:
                    reload_6 = (_b.sent()).reload;
                    return [4 /*yield*/, reload_6(account)];
                case 23:
                    res = _b.sent();
                    return [2 /*return*/, { instance: res.instance, authentication: res.authentication }];
                case 24: return [4 /*yield*/, import("./multi/reload-multi")];
                case 25:
                    reloadInstance = (_b.sent()).reloadInstance;
                    return [4 /*yield*/, reloadInstance(account.authentication)];
                case 26: return [2 /*return*/, _b.sent()];
                case 27:
                    {
                        warn("PapillonMultiService space should never be reloaded.", "multiservice");
                    }
                    _b.label = 28;
                case 28:
                    {
                        console.warn("Service not implemented");
                        return [2 /*return*/, { instance: undefined, authentication: undefined }];
                    }
                    _b.label = 29;
                case 29: return [2 /*return*/];
            }
        });
    });
}
