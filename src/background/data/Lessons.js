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
import { getLessons, updateLessonsState } from "../utils/lessons";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { TimetableClassStatus, } from "@/services/shared/Timetable";
import { formatHoursMinutes } from "../utils/format";
var getAllLessonsForDay = function (lessons) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var week = dateToEpochWeekNumber(date);
    var timetable = lessons[week] || [];
    var newDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    var day = timetable.filter(function (lesson) {
        var startTimetableDate = new Date(lesson.startTimestamp);
        var lessonDate = Date.UTC(startTimetableDate.getFullYear(), startTimetableDate.getMonth(), startTimetableDate.getDate());
        return lessonDate === newDate;
    });
    return day;
};
var getDifferences = function (currentLessons, updatedLessons, compareFn) {
    return updatedLessons.filter(function (updatedItem) {
        return !currentLessons.some(function (item) { return compareFn(item, updatedItem); });
    });
};
var fetchLessons = function () { return __awaiter(void 0, void 0, void 0, function () {
    var account, notificationsTypesPermissions, currentLessons, weekNumber, updatedLessons, differencesStatus, differencesTimestamp, totalDifference, _a, dateLessonsDebut, dateLessonsFin, dateLessonsDebut, dateLessonsFin, statut, lessonsCounts_1, lessonsPreview;
    var _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                account = getCurrentAccount();
                notificationsTypesPermissions = account.personalization.notifications;
                currentLessons = getLessons();
                if (!(notificationsTypesPermissions === null || notificationsTypesPermissions === void 0 ? void 0 : notificationsTypesPermissions.timetable)) {
                    return [2 /*return*/, getAllLessonsForDay(currentLessons)];
                }
                if (!__DEV__) return [3 /*break*/, 2];
                return [4 /*yield*/, papillonNotify({
                        id: "statusBackground",
                        title: account.name,
                        body: "Récupération de l'emploi du temps...",
                        android: {
                            progress: {
                                max: 100,
                                current: (100 / 6) * 4,
                                indeterminate: false,
                            },
                        },
                    }, "Status")];
            case 1:
                _g.sent();
                _g.label = 2;
            case 2:
                weekNumber = dateToEpochWeekNumber(new Date());
                return [4 /*yield*/, updateLessonsState(account, weekNumber)];
            case 3:
                _g.sent();
                updatedLessons = getLessons();
                if (getAllLessonsForDay(currentLessons).length === 0 &&
                    getAllLessonsForDay(currentLessons).length !== 0) {
                    return [2 /*return*/, getAllLessonsForDay(updatedLessons)];
                }
                differencesStatus = getDifferences((_b = getAllLessonsForDay(currentLessons)) !== null && _b !== void 0 ? _b : [], (_c = getAllLessonsForDay(updatedLessons)) !== null && _c !== void 0 ? _c : [], function (a, b) { return a.status === b.status && a.statusText === b.statusText; });
                differencesTimestamp = getDifferences((_d = getAllLessonsForDay(currentLessons)) !== null && _d !== void 0 ? _d : [], (_e = getAllLessonsForDay(updatedLessons)) !== null && _e !== void 0 ? _e : [], function (a, b) {
                    return a.startTimestamp === b.startTimestamp && a.endTimestamp === b.endTimestamp;
                });
                totalDifference = differencesStatus.length + differencesTimestamp.length;
                _a = totalDifference;
                switch (_a) {
                    case 0: return [3 /*break*/, 4];
                    case 1: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 10];
            case 4: return [3 /*break*/, 12];
            case 5:
                if (!(differencesTimestamp.length === 1)) return [3 /*break*/, 7];
                dateLessonsDebut = formatHoursMinutes(differencesTimestamp[0].startTimestamp);
                dateLessonsFin = formatHoursMinutes(differencesTimestamp[0].endTimestamp);
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-lessons"),
                        title: "[".concat(account.name, "] Changement de cours"),
                        subtitle: new Date(differencesTimestamp[0].startTimestamp).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        }),
                        body: "".concat(differencesTimestamp[0].subject, " (").concat(dateLessonsDebut, "-").concat(dateLessonsFin, ") : Horaire du cours modifi\u00E9"),
                        data: {
                            accountID: account.localID,
                            page: "LessonsDocument",
                            parameters: {
                                lesson: differencesTimestamp[0],
                            }
                        }
                    }, "Lessons")];
            case 6:
                _g.sent();
                return [3 /*break*/, 9];
            case 7:
                dateLessonsDebut = formatHoursMinutes(differencesStatus[0].startTimestamp);
                dateLessonsFin = formatHoursMinutes(differencesStatus[0].endTimestamp);
                statut = "";
                switch (differencesStatus[0].status) {
                    case TimetableClassStatus.TEST:
                        statut = "Devoir surveillé";
                        break;
                    case TimetableClassStatus.MODIFIED:
                        statut = "Cours modifié, ouvrir pour plus de détails";
                        break;
                    default:
                        if (differencesStatus[0].statusText === "Changement de salle") {
                            statut = "Changement de salle";
                            if (differencesStatus[0].room) {
                                if (differencesStatus[0].room.includes(",")) {
                                    statut += ", ouvrir pour plus de détails";
                                }
                                else {
                                    statut += " \u27A1\uFE0F ".concat(differencesStatus[0].room);
                                }
                            }
                        }
                        else if (differencesStatus[0].statusText === "Devoir Surveillé") {
                            statut = "Devoir surveillé";
                        }
                        else {
                            statut = (_f = differencesStatus[0].statusText) !== null && _f !== void 0 ? _f : "";
                        }
                        break;
                }
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-lessons"),
                        title: "[".concat(account.name, "] Changement de cours"),
                        subtitle: new Date(differencesStatus[0].startTimestamp).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        }),
                        body: "".concat(differencesStatus[0].subject, " (").concat(dateLessonsDebut, "-").concat(dateLessonsFin, ") : ").concat(statut),
                        data: {
                            accountID: account.localID,
                            page: "LessonsDocument",
                            parameters: {
                                lesson: differencesStatus[0],
                            }
                        }
                    }, "Lessons")];
            case 8:
                _g.sent();
                _g.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10:
                lessonsCounts_1 = {};
                __spreadArray(__spreadArray([], differencesStatus, true), differencesTimestamp, true).forEach(function (hw) {
                    lessonsCounts_1[hw.title] = (lessonsCounts_1[hw.title] || 0) + 1;
                });
                lessonsPreview = Object.entries(lessonsCounts_1)
                    .map(function (_a) {
                    var subject = _a[0], count = _a[1];
                    return count > 1 ? "".concat(count, "x ").concat(subject) : subject;
                })
                    .join(", ");
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-lessons"),
                        title: "[".concat(account.name, "] Changement de cours"),
                        subtitle: new Date(differencesStatus[0].startTimestamp).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        }),
                        body: "".concat(totalDifference, " cours modifi\u00E9s :<br />\n            ").concat(lessonsPreview),
                        data: {
                            accountID: account.localID,
                            page: "Lessons"
                        }
                    }, "Lessons")];
            case 11:
                _g.sent();
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/, differencesStatus !== null && differencesStatus !== void 0 ? differencesStatus : differencesTimestamp];
        }
    });
}); };
export { fetchLessons };
