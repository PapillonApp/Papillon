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
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import { decodePeriod } from "./period";
import pronote from "pawnote";
import { info } from "@/utils/logger/logger";
var getTab = function (account) {
    if (!account.instance)
        throw new ErrorServiceUnauthenticated("pronote");
    var tab = account.instance.user.resources[0].tabs.get(pronote.TabLocation.Grades);
    if (!tab)
        throw new Error("Tu n'as pas accès à l'onglet 'Notes' dans PRONOTE");
    return tab;
};
export var getGradesPeriods = function (account) {
    var tab = getTab(account);
    info("PRONOTE->getGradesPeriods(): OK", "pronote");
    return {
        default: tab.defaultPeriod.name,
        periods: tab.periods.map(decodePeriod),
    };
};
var decodeGradeValue = function (value) {
    var _a;
    if (typeof value === "undefined")
        return { value: null, disabled: true, status: "unknown" };
    switch (value.kind) {
        case pronote.GradeKind.Grade:
            return { value: (_a = value.points) !== null && _a !== void 0 ? _a : 0, disabled: false, status: null };
        case pronote.GradeKind.Absent:
            return { value: null, disabled: true, status: "Abs" };
        case pronote.GradeKind.Exempted:
            return { value: null, disabled: true, status: "Disp" };
        case pronote.GradeKind.NotGraded:
            return { value: null, disabled: true, status: "N. Not" };
        case pronote.GradeKind.Unfit:
            return { value: null, disabled: true, status: null };
        case pronote.GradeKind.Unreturned:
            return { value: null, disabled: true, status: null };
        case pronote.GradeKind.AbsentZero:
            return { value: 0, disabled: false, status: "Abs" };
        case pronote.GradeKind.UnreturnedZero:
            return { value: 0, disabled: false, status: null };
        default:
            return { value: null, disabled: true, status: null };
    }
};
export var getGradesAndAverages = function (account, periodName) { return __awaiter(void 0, void 0, void 0, function () {
    var tab, period, overview, averages, grades;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tab = getTab(account);
                period = tab.periods.find(function (p) { return p.name === periodName; });
                if (!period)
                    throw new Error("La période sélectionnée n'a pas été trouvée.");
                return [4 /*yield*/, pronote.gradesOverview(account.instance, period)];
            case 1:
                overview = _a.sent();
                averages = {
                    classOverall: decodeGradeValue(overview.classAverage),
                    overall: decodeGradeValue(overview.overallAverage),
                    subjects: overview.subjectsAverages.map(function (s) { return ({
                        classAverage: decodeGradeValue(s.class_average),
                        color: s.backgroundColor,
                        max: decodeGradeValue(s.max),
                        subjectName: s.subject.name,
                        id: s.subject.id ? s.subject.id.toString() : undefined,
                        min: decodeGradeValue(s.min),
                        average: decodeGradeValue(s.student),
                        outOf: decodeGradeValue(s.outOf),
                    }); }),
                };
                grades = overview.grades.map(function (g) {
                    var _a;
                    return ({
                        id: buildLocalID(g),
                        subjectName: g.subject.name,
                        subjectId: g.subject.id ? g.subject.id.toString() : undefined,
                        description: g.comment,
                        timestamp: g.date.getTime(),
                        subjectFile: g.subjectFile && decodeAttachment(g.subjectFile),
                        correctionFile: g.correctionFile && decodeAttachment(g.correctionFile),
                        isBonus: g.isBonus,
                        isOptional: g.isOptional,
                        outOf: decodeGradeValue(g.outOf),
                        coefficient: (_a = g.coefficient) !== null && _a !== void 0 ? _a : 1,
                        student: decodeGradeValue(g.value),
                        average: decodeGradeValue(g.average),
                        max: decodeGradeValue(g.max),
                        min: decodeGradeValue(g.min),
                    });
                });
                return [2 /*return*/, { averages: averages, grades: grades }];
        }
    });
}); };
export var buildLocalID = function (g) {
    return "".concat(g.subject.name, ":").concat(g.date.getTime(), "/").concat(g.comment || "none");
};
