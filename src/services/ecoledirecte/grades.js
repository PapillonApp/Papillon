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
import ecoledirecte, { GradeKind, } from "pawdirecte";
import { AttachmentType } from "@/services/shared/Attachment";
var decodePeriod = function (p) {
    return {
        name: p.name,
        id: p.id,
        startTimestamp: p.startDate.getTime(),
        endTimestamp: p.endDate.getTime(),
        yearly: p.yearly
    };
};
var decodeGradeValue = function (value) {
    var _a, _b, _c, _d, _e;
    if (typeof value === "undefined")
        return { value: null, disabled: true, status: null };
    switch (value.kind) {
        case GradeKind.Grade:
            return { value: (_a = value.points) !== null && _a !== void 0 ? _a : 0, disabled: false, status: null };
        case GradeKind.Absent:
            return { value: (_b = value.points) !== null && _b !== void 0 ? _b : 0, disabled: true, status: "Abs" };
        case GradeKind.Exempted:
            return { value: (_c = value.points) !== null && _c !== void 0 ? _c : 0, disabled: true, status: "Disp" };
        case GradeKind.NotGraded:
            return { value: (_d = value.points) !== null && _d !== void 0 ? _d : 0, disabled: true, status: "N. Not" };
        default:
            return { value: (_e = value.points) !== null && _e !== void 0 ? _e : 0, disabled: true, status: null };
    }
};
var getGradeValue = function (value) {
    return {
        disabled: false,
        value: value ? Number(value) : 0,
        status: null,
    };
};
export var getGradesPeriods = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ecoledirecte.studentGrades(account.authentication.session, account.authentication.account, "")];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.periods.map(decodePeriod)];
        }
    });
}); };
export var getGradesAndAverages = function (account, periodName) { return __awaiter(void 0, void 0, void 0, function () {
    var period, response, overview, averages, grades;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getGradesPeriods(account)];
            case 1:
                period = (_a.sent()).find(function (p) { return p.name === periodName; });
                if (!period)
                    throw new Error("La période sélectionnée n'a pas été trouvée.");
                return [4 /*yield*/, ecoledirecte.studentGrades(account.authentication.session, account.authentication.account, "")];
            case 2:
                response = _a.sent();
                overview = response.overview[period.id];
                averages = {
                    classOverall: decodeGradeValue(overview.classAverage),
                    overall: decodeGradeValue(overview.overallAverage),
                    subjects: overview.subjects
                        .filter(function (s) { return s.studentAverage.kind === GradeKind.Grade; })
                        .map(function (s) {
                        return {
                            classAverage: decodeGradeValue(s.classAverage),
                            color: s.color,
                            max: decodeGradeValue(s.maxAverage),
                            subjectName: s.name,
                            min: decodeGradeValue(s.minAverage),
                            average: decodeGradeValue(s.studentAverage),
                            outOf: decodeGradeValue(s.outOf),
                        };
                    })
                };
                grades = response.grades
                    .filter(function (g) { return g.period.id === period.id && !period.yearly; })
                    .map(function (g) {
                    var _a;
                    return {
                        id: buildLocalID(g),
                        subjectName: g.subject.name,
                        description: g.comment,
                        timestamp: g.date.getTime(),
                        subjectFile: {
                            type: AttachmentType.Link,
                            name: "Sujet",
                            url: g.subjectFilePath,
                        },
                        correctionFile: {
                            type: AttachmentType.Link,
                            name: "Corrigé",
                            url: g.correctionFilePath,
                        },
                        isBonus: false,
                        isOptional: g.isOptional,
                        outOf: getGradeValue(g.outOf),
                        coefficient: (_a = g.coefficient) !== null && _a !== void 0 ? _a : 1,
                        student: decodeGradeValue(g.value),
                        average: decodeGradeValue(g.average),
                        max: decodeGradeValue(g.max),
                        min: decodeGradeValue(g.min),
                    };
                });
                return [2 /*return*/, { averages: averages, grades: grades }];
        }
    });
}); };
export var buildLocalID = function (g) {
    return "".concat(g.subject.name, ":").concat(g.date.getTime(), "/").concat(g.comment || "none");
};
