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
import { log } from "@/utils/logger/logger";
export var getChats = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, getChats_1, getChats_2, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.EcoleDirecte: return [3 /*break*/, 3];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 6];
                }
                return [3 /*break*/, 8];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                getChats_1 = (_b.sent()).getChats;
                return [2 /*return*/, getChats_1(account)];
            case 3: return [4 /*yield*/, import("./ecoledirecte/chats")];
            case 4:
                getChats_2 = (_b.sent()).getChats;
                return [4 /*yield*/, getChats_2(account)];
            case 5: return [2 /*return*/, _b.sent()];
            case 6:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, getChats(service)];
            case 7: return [2 /*return*/, _b.sent()];
            case 8:
                console.info("[getChats]: returning empty since ".concat(account.service, " not implemented."));
                return [2 /*return*/, []];
        }
    });
}); };
export var getChatRecipients = function (account, chat) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, getChatRecipients_1, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                getChatRecipients_1 = (_b.sent()).getChatRecipients;
                return [4 /*yield*/, getChatRecipients_1(account, chat)];
            case 3: return [2 /*return*/, _b.sent()];
            case 4:
                {
                    // TODO
                    return [2 /*return*/, [{
                                id: account.localID,
                                name: account.name,
                                class: null
                            },
                            {
                                id: chat.creator,
                                name: chat.creator,
                                class: null
                            }]];
                }
                _b.label = 5;
            case 5:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, getChatRecipients(service, chat)];
            case 6: return [2 /*return*/, _b.sent()];
            case 7:
                console.info("[getChatRecipients]: returning empty since ".concat(account.service, " not implemented."));
                return [2 /*return*/, []];
        }
    });
}); };
export var sendMessageInChat = function (account, chat, content) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sendMessageInChat_1, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                sendMessageInChat_1 = (_b.sent()).sendMessageInChat;
                return [4 /*yield*/, sendMessageInChat_1(account, chat, content)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                {
                    // TODO
                }
                _b.label = 5;
            case 5:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, sendMessageInChat(service, chat, content)];
            case 6: return [2 /*return*/, _b.sent()];
            case 7:
                console.info("[sendMessageInChat]: Not Implementend.");
                _b.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); };
export var getChatMessages = function (account, chat) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, getChatMessages_1, getChatMessages_2, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.EcoleDirecte: return [3 /*break*/, 4];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 7];
                }
                return [3 /*break*/, 9];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                getChatMessages_1 = (_b.sent()).getChatMessages;
                return [4 /*yield*/, getChatMessages_1(account, chat)];
            case 3: return [2 /*return*/, _b.sent()];
            case 4: return [4 /*yield*/, import("./ecoledirecte/chats")];
            case 5:
                getChatMessages_2 = (_b.sent()).getChatMessages;
                return [4 /*yield*/, getChatMessages_2(account, chat)];
            case 6: return [2 /*return*/, [_b.sent()]];
            case 7:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, getChatMessages(service, chat)];
            case 8: return [2 /*return*/, _b.sent()];
            case 9:
                console.info("[getChatMessages]: returning empty since ".concat(account.service, " not implemented."));
                return [2 /*return*/, []];
        }
    });
}); };
export var createDiscussionRecipients = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, createDiscussionRecipients_1, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 3];
                }
                return [3 /*break*/, 5];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                createDiscussionRecipients_1 = (_b.sent()).createDiscussionRecipients;
                return [2 /*return*/, createDiscussionRecipients_1(account)];
            case 3:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, createDiscussionRecipients(service)];
            case 4: return [2 /*return*/, _b.sent()];
            case 5:
                console.info("[createDiscussionRecipients]: returning empty since ".concat(account.service, " not implemented."));
                return [2 /*return*/, []];
        }
    });
}); };
export var createDiscussion = function (account, subject, content, recipients) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, createDiscussion_1, service;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = account.service;
                switch (_a) {
                    case AccountService.Pronote: return [3 /*break*/, 1];
                    case AccountService.PapillonMultiService: return [3 /*break*/, 3];
                }
                return [3 /*break*/, 5];
            case 1: return [4 /*yield*/, import("./pronote/chats")];
            case 2:
                createDiscussion_1 = (_b.sent()).createDiscussion;
                createDiscussion_1(account, subject, content, recipients);
                return [3 /*break*/, 6];
            case 3:
                service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
                if (!service) {
                    log("No service set in multi-service space for feature \"Chats\"", "multiservice");
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, createDiscussion(service, subject, content, recipients)];
            case 4: return [2 /*return*/, _b.sent()];
            case 5:
                console.info("[createDiscussion]: doing nothing since ".concat(account.service, " is not implemented."));
                _b.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
