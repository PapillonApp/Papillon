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
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getHomeworks, updateHomeworksState } from "../utils/homeworks";
import { calculateWeekNumber, dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
var getDifferences = function (currentHomeworks, updatedHomeworks) {
    return updatedHomeworks.filter(function (updatedItem) {
        return !currentHomeworks.some(function (item) {
            return item.due === updatedItem.due && item.content === updatedItem.content;
        });
    });
};
var fetchHomeworks = function () { return __awaiter(void 0, void 0, void 0, function () {
    var account, notificationsTypesPermissions, firstDate, firstDateEpoch, SemaineAct, currentHwSemaineActuelle, currentHwSemaineProchaine, updatedHwSemaineActuelle, updatedHwSemaineProchaine, differencesHwSemaineActuelle, differencesHwSemaineProchaine, differences, _a, subjectCounts_1, subjectPreview, subtitle;
    var _b, _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                account = getCurrentAccount();
                notificationsTypesPermissions = account.personalization.notifications;
                firstDate = ((_c = (_b = account.instance) === null || _b === void 0 ? void 0 : _b.instance) === null || _c === void 0 ? void 0 : _c.firstDate) || null;
                if (!firstDate) {
                    firstDate = new Date(Date.UTC(new Date().getFullYear(), 8, 1));
                }
                firstDateEpoch = dateToEpochWeekNumber(firstDate);
                SemaineAct = dateToEpochWeekNumber(new Date());
                currentHwSemaineActuelle = (_d = getHomeworks()[SemaineAct]) !== null && _d !== void 0 ? _d : [];
                if (!(notificationsTypesPermissions === null || notificationsTypesPermissions === void 0 ? void 0 : notificationsTypesPermissions.homeworks)) {
                    return [2 /*return*/, currentHwSemaineActuelle];
                }
                if (!__DEV__) return [3 /*break*/, 2];
                return [4 /*yield*/, papillonNotify({
                        id: "statusBackground",
                        title: account.name,
                        body: "Récupération des derniers devoirs...",
                        android: {
                            progress: {
                                max: 100,
                                current: (100 / 6) * 2,
                                indeterminate: false,
                            },
                        },
                    }, "Status")];
            case 1:
                _h.sent();
                _h.label = 2;
            case 2:
                currentHwSemaineProchaine = (_e = getHomeworks()[SemaineAct + 1]) !== null && _e !== void 0 ? _e : [];
                return [4 /*yield*/, updateHomeworksState(account)];
            case 3:
                _h.sent();
                updatedHwSemaineActuelle = (_f = getHomeworks()[SemaineAct]) !== null && _f !== void 0 ? _f : [];
                updatedHwSemaineProchaine = (_g = getHomeworks()[SemaineAct + 1]) !== null && _g !== void 0 ? _g : [];
                differencesHwSemaineActuelle = getDifferences(currentHwSemaineActuelle, updatedHwSemaineActuelle);
                differencesHwSemaineProchaine = getDifferences(currentHwSemaineProchaine, updatedHwSemaineProchaine);
                differences = differencesHwSemaineActuelle.length +
                    differencesHwSemaineProchaine.length;
                _a = differences;
                switch (_a) {
                    case 0: return [3 /*break*/, 4];
                    case 1: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 10];
            case 4: return [3 /*break*/, 12];
            case 5:
                if (!(differencesHwSemaineActuelle.length === 1)) return [3 /*break*/, 7];
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-homeworks"),
                        title: "[".concat(account.name, "] Nouveau devoir en ").concat(differencesHwSemaineActuelle[0].subject),
                        subtitle: "Semaine ".concat(calculateWeekNumber(new Date()).toString()),
                        body: parse_homeworks(differencesHwSemaineActuelle[0].content),
                        data: {
                            accountID: account.localID,
                            page: "HomeworksDocument",
                            parameters: {
                                homework: differencesHwSemaineActuelle[0],
                            }
                        }
                    }, "Homeworks")];
            case 6:
                _h.sent();
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, papillonNotify({
                    id: "".concat(account.name, "-homeworks"),
                    title: "[".concat(account.name, "] Nouveau devoir en ").concat(differencesHwSemaineProchaine[0].subject),
                    subtitle: "Semaine ".concat((calculateWeekNumber(new Date()) + 1).toString()),
                    body: parse_homeworks(differencesHwSemaineProchaine[0].content),
                    data: {
                        accountID: account.localID,
                        page: "HomeworksDocument",
                        parameters: {
                            homework: differencesHwSemaineProchaine[0],
                        }
                    }
                }, "Homeworks")];
            case 8:
                _h.sent();
                _h.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10:
                subjectCounts_1 = {};
                __spreadArray(__spreadArray([], differencesHwSemaineActuelle, true), differencesHwSemaineProchaine, true).forEach(function (hw) {
                    subjectCounts_1[hw.subject] = (subjectCounts_1[hw.subject] || 0) + 1;
                });
                subjectPreview = Object.entries(subjectCounts_1)
                    .map(function (_a) {
                    var subject = _a[0], count = _a[1];
                    return count > 1 ? "".concat(count, "x ").concat(subject) : subject;
                })
                    .join(", ");
                subtitle = "Semaine ";
                if (differencesHwSemaineActuelle.length > 0) {
                    subtitle += calculateWeekNumber(new Date()).toString();
                }
                if (differencesHwSemaineProchaine.length > 0) {
                    if (differencesHwSemaineActuelle.length > 0) {
                        subtitle += " et ".concat((calculateWeekNumber(new Date()) + 1).toString());
                    }
                    else {
                        subtitle += (calculateWeekNumber(new Date()) + 1).toString();
                    }
                }
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-homeworks"),
                        title: "[".concat(account.name, "] Nouveaux devoirs"),
                        subtitle: subtitle,
                        body: "\n            ".concat(differences, " nouveaux devoirs :<br />\n            ").concat(subjectPreview, "\n            "),
                        data: {
                            accountID: account.localID,
                            page: "Homeworks"
                        }
                    }, "Homeworks")];
            case 11:
                _h.sent();
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/, updatedHwSemaineActuelle !== null && updatedHwSemaineActuelle !== void 0 ? updatedHwSemaineActuelle : updatedHwSemaineProchaine];
        }
    });
}); };
export { fetchHomeworks };
