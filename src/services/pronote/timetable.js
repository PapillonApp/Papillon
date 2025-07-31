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
import { TimetableClassStatus } from "../shared/Timetable";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote from "pawnote";
import { info } from "@/utils/logger/logger";
export var pronoteFirstDate = new Date("2024-09-01");
var decodeTimetableClass = function (c) {
    var _a, _b, _c, _d;
    var base = {
        startTimestamp: c.startDate.getTime(),
        endTimestamp: c.endDate.getTime(),
        additionalNotes: c.notes,
        backgroundColor: c.backgroundColor,
    };
    if (c.is === "lesson") {
        return __assign({ type: "lesson", id: c.id, title: c.subject.name, subject: c.subject.name, room: c.classrooms.join(", ") || void 0, teacher: (_b = (_a = c.teacherNames) === null || _a === void 0 ? void 0 : _a.join(", ")) !== null && _b !== void 0 ? _b : void 0, group: c.groupNames.join(", ") || void 0, status: c.status === "Cours annulé" || c.status === "Prof. absent" || c.status === "Classe absente" || c.status === "Prof./pers. absent" || c.status === "Sortie pédagogique" ? TimetableClassStatus.CANCELED : c.test ? TimetableClassStatus.TEST : void 0, statusText: c.test ? "Devoir Surveillé" : c.status, ressourceID: (_c = c.lessonResourceID) !== null && _c !== void 0 ? _c : void 0 }, base);
    }
    else if (c.is === "activity") {
        return __assign({ type: "activity", id: c.id, subject: "Activité", title: c.title }, base);
    }
    else if (c.is === "detention") {
        return __assign({ type: "detention", id: c.id, subject: "", title: (_d = c.title) !== null && _d !== void 0 ? _d : "Sans titre", room: c.classrooms.join(", ") || void 0 }, base);
    }
    throw new Error("pronote: unknown class type");
};
export var getTimetableForWeek = function (account, weekNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var timetable, timetable_formatted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("pronote");
                if (weekNumber < 1 || weekNumber > 62) {
                    info("PRONOTE->getTimetableForWeek(): Le numéro de semaine est en dehors des bornes (1<>62), une liste vide est retournée.", "pronote");
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, pronote.timetableFromWeek(account.instance, weekNumber)];
            case 1:
                timetable = _a.sent();
                pronote.parseTimetable(account.instance, timetable, {
                    withSuperposedCanceledClasses: false,
                    withCanceledClasses: true,
                    withPlannedClasses: true
                });
                timetable_formatted = timetable.classes.map(decodeTimetableClass);
                return [2 /*return*/, timetable_formatted];
        }
    });
}); };
var category_match = {
    0: undefined,
    1: "Cours",
    2: "Correction",
    3: "Devoir sur table",
    4: "Interrogation orale",
    5: "Travaux Dirigés",
    6: "Travaux Pratiques",
    7: "Évaluation",
    8: "Enseignements Pratiques Interdisciplinaires",
    9: "Accompagnement personnalisé",
    12: "Visioconférence",
};
export var getWeekFrequency = function (account, weekNumber) {
    if (!account.instance)
        throw new ErrorServiceUnauthenticated("pronote");
    if (weekNumber < 1 || weekNumber > 62) {
        info("PRONOTE->getTimetableForWeek(): Le numéro de semaine est en dehors des bornes (1<>62), null est retourné.", "pronote");
        return null;
    }
    var frequency = pronote.frequency(account.instance, weekNumber);
    if (!frequency)
        return null;
    return {
        textLabel: "Semaine",
        freqLabel: frequency.label,
        num: frequency.fortnight
    };
};
export var getCourseRessources = function (account, course) { return __awaiter(void 0, void 0, void 0, function () {
    var ressources, ressource;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ressources = [];
                if (!(course.type === "lesson" && course.ressourceID)) return [3 /*break*/, 2];
                return [4 /*yield*/, pronote.resource(account.instance, course.ressourceID)];
            case 1:
                ressource = (_a.sent()).contents;
                ressources = ressource.map(function (r) {
                    var category = category_match[r.category];
                    return {
                        title: r.title,
                        description: r.description,
                        category: category,
                        files: r.files.map(function (f) {
                            return {
                                name: f.name,
                                url: f.url
                            };
                        })
                    };
                });
                _a.label = 2;
            case 2: return [2 /*return*/, ressources];
        }
    });
}); };
