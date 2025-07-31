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
import { useNewsStore } from "@/stores/news";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error, log } from "@/utils/logger/logger";
import { newsRead } from "pawnote";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { getFeatureAccount } from "@/utils/multiservice";
/**
 * Updates the state and cache for the news.
 */
export function updateNewsInCache(account) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getNews, informations, getNews, informations, getNews, informations, getNews, informations, service;
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
                case 1: return [4 /*yield*/, import("./pronote/news")];
                case 2:
                    getNews = (_b.sent()).getNews;
                    return [4 /*yield*/, getNews(account)];
                case 3:
                    informations = _b.sent();
                    useNewsStore.getState().updateInformations(informations);
                    return [3 /*break*/, 16];
                case 4:
                    {
                        useNewsStore.getState().updateInformations([]);
                        return [3 /*break*/, 16];
                    }
                    _b.label = 5;
                case 5:
                    if (!checkIfSkoSupported(account, "News")) {
                        error("[updateNewsInCache]: This Skolengo instance doesn't support News.", "skolengo");
                        return [3 /*break*/, 16];
                    }
                    return [4 /*yield*/, import("./skolengo/data/news")];
                case 6:
                    getNews = (_b.sent()).getNews;
                    return [4 /*yield*/, getNews(account)];
                case 7:
                    informations = _b.sent();
                    useNewsStore.getState().updateInformations(informations);
                    return [3 /*break*/, 16];
                case 8: return [4 /*yield*/, import("./ecoledirecte/news")];
                case 9:
                    getNews = (_b.sent()).getNews;
                    return [4 /*yield*/, getNews(account)];
                case 10:
                    informations = _b.sent();
                    useNewsStore.getState().updateInformations(informations);
                    return [3 /*break*/, 16];
                case 11: return [4 /*yield*/, import("./multi/data/news")];
                case 12:
                    getNews = (_b.sent()).getNews;
                    return [4 /*yield*/, getNews(account)];
                case 13:
                    informations = _b.sent();
                    useNewsStore.getState().updateInformations(informations);
                    return [3 /*break*/, 16];
                case 14:
                    {
                        service = getFeatureAccount(MultiServiceFeature.News, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"News\"", "multiservice");
                            return [3 /*break*/, 16];
                        }
                        return [2 /*return*/, updateNewsInCache(service)];
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
 * Sets news read
 */
export function setNewsRead(account_1, message_1) {
    return __awaiter(this, arguments, void 0, function (account, message, read) {
        var _a, service;
        if (read === void 0) { read = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = account.service;
                    switch (_a) {
                        case AccountService.Pronote: return [3 /*break*/, 1];
                        case AccountService.Local: return [3 /*break*/, 3];
                        case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                        case AccountService.Multi: return [3 /*break*/, 5];
                        case AccountService.PapillonMultiService: return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 7];
                case 1:
                    if (!account.instance) {
                        error("[setNewsRead]: Instance is undefined.", "pronote");
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, newsRead(account.instance, message.ref, read)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 3:
                    {
                        return [3 /*break*/, 8];
                    }
                    _b.label = 4;
                case 4:
                    {
                        return [3 /*break*/, 8];
                    }
                    _b.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    {
                        service = getFeatureAccount(MultiServiceFeature.News, account.localID);
                        if (!service) {
                            log("No service set in multi-service space for feature \"News\"", "multiservice");
                            return [3 /*break*/, 8];
                        }
                        return [2 /*return*/, setNewsRead(service, message, read)];
                    }
                    _b.label = 7;
                case 7:
                    {
                        throw new Error("Service not implemented.");
                    }
                    _b.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
