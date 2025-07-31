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
import pronote from "pawnote";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import { info } from "@/utils/logger/logger";
export var getChats = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var chats, studentName, parseFrenchDate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance) {
                    throw new ErrorServiceUnauthenticated("pronote");
                }
                return [4 /*yield*/, pronote.discussions(account.instance)];
            case 1:
                chats = _a.sent();
                info("PRONOTE->getChats(): OK", "pronote");
                studentName = account.instance.user.resources[0].name;
                parseFrenchDate = function (dateText) {
                    var days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
                    var parts = dateText.split(" ");
                    var datePart = parts.find(function (part) { return part.includes("/"); });
                    if (datePart) {
                        var _a = datePart.split("/"), day = _a[0], month = _a[1], year = _a[2];
                        return new Date("20".concat(year, "-").concat(month, "-").concat(day));
                    }
                    var today = new Date();
                    var todayIndex = today.getDay();
                    var dayName = parts[0].toLowerCase();
                    var targetIndex = days.indexOf(dayName);
                    if (targetIndex !== -1) {
                        var diff = targetIndex - todayIndex;
                        var targetDate = new Date();
                        targetDate.setDate(today.getDate() + (diff <= 0 ? diff : diff - 7));
                        return targetDate;
                    }
                    return today;
                };
                return [2 /*return*/, chats.items.map(function (chat) {
                        var _a, _b;
                        return ({
                            id: chat.participantsMessageID,
                            read: true,
                            subject: chat.subject,
                            creator: (_a = chat.creator) !== null && _a !== void 0 ? _a : studentName,
                            recipient: (_b = chat.recipientName) !== null && _b !== void 0 ? _b : studentName,
                            date: parseFrenchDate(chat.dateAsFrenchText),
                            _handle: chat
                        });
                    })];
        }
    });
}); };
export var getChatRecipients = function (account, chat) { return __awaiter(void 0, void 0, void 0, function () {
    var recipients;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                return [4 /*yield*/, pronote.discussionRecipients(account.instance, chat._handle)];
            case 1:
                recipients = _a.sent();
                return [2 /*return*/, recipients.map(function (recipient) {
                        var _a = recipient.name.split("("), namePart = _a[0], classPart = _a[1];
                        return {
                            id: recipient.id,
                            name: namePart.trim(),
                            class: classPart ? classPart.replace(")", "").trim() : null
                        };
                    })];
        }
    });
}); };
export var sendMessageInChat = function (account, chat, content) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                return [4 /*yield*/, pronote.discussionSendMessage(account.instance, chat._handle, content)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
export var getChatMessages = function (account, chat) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, studentName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                return [4 /*yield*/, pronote.discussionMessages(account.instance, chat._handle)];
            case 1:
                messages = _a.sent();
                info("PRONOTE->getChatMessages(): OK", "pronote");
                studentName = account.instance.user.resources[0].name;
                messages.sents.sort(function (a, b) { return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime(); });
                return [2 /*return*/, messages.sents.map(function (message) {
                        var _a, _b;
                        return {
                            id: message.id,
                            subject: "",
                            content: message.content,
                            author: (_b = (_a = message.author) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : studentName,
                            date: message.creationDate,
                            attachments: message.files.map(decodeAttachment)
                        };
                    })];
        }
    });
}); };
export var createDiscussionRecipients = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var recipientsALL, recipients;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                return [4 /*yield*/, Promise.all(account.instance.user.resources.flatMap(function (resource) {
                        return [
                            pronote.EntityKind.Teacher,
                            pronote.EntityKind.Personal
                        ].map(function (kind) { return pronote.newDiscussionRecipients(account.instance, kind); });
                    }))];
            case 1:
                recipientsALL = _a.sent();
                recipients = recipientsALL.flat();
                info("PRONOTE->createDiscussionRecipients(): OK", "pronote");
                return [2 /*return*/, recipients.map(function (recipient) { return ({
                        name: recipient.name,
                        subject: recipient.subjects.length > 0
                            ? recipient.subjects.map(function (subject) { return subject.name; }).join(", ")
                            : undefined,
                        _handle: recipient
                    }); })];
        }
    });
}); };
export var createDiscussion = function (account, subject, content, recipients) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                return [4 /*yield*/, pronote.newDiscussion(account.instance, subject, content, recipients.map(function (r) { return r._handle; }))];
            case 1:
                _a.sent();
                info("PRONOTE->createDiscussion(): OK", "pronote");
                return [2 /*return*/];
        }
    });
}); };
