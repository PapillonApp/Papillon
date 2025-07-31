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
import { getPeriod } from "./period";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
var SKOLENGO_DEFAULT_SCALE = 20;
var decodeGradeNumber = function (value) {
    return typeof value === "number" ?
        { value: value, disabled: false, status: null }
        : { value: null, disabled: true, status: null };
};
var getSubjectMinMax = function (evalSubj) {
    var outOf = decodeGradeNumber(evalSubj.scale || SKOLENGO_DEFAULT_SCALE);
    if (evalSubj.evaluations.filter(function (e) { return e.evaluationResult.mark !== null && !e.evaluationResult.nonEvaluationReason; }).length === 0)
        return { min: { value: null, disabled: true, status: null }, max: { value: null, disabled: true, status: null }, outOf: outOf };
    var _a = evalSubj.evaluations.filter(function (e) { return e.evaluationResult.mark !== null; })
        .map(function (e) { return ((e.evaluationResult.mark) / (e.scale || SKOLENGO_DEFAULT_SCALE)) * (evalSubj.scale || SKOLENGO_DEFAULT_SCALE); })
        .reduce(function (_a, e) {
        var minAcc = _a[0], maxAcc = _a[1];
        return [Math.min(minAcc, e), Math.max(maxAcc, e)];
    }, [evalSubj.scale || SKOLENGO_DEFAULT_SCALE, 0]), minimum = _a[0], maximum = _a[1];
    return { min: { value: minimum, disabled: false, status: null }, max: { value: maximum, disabled: false, status: null }, outOf: outOf };
};
var getOverall = function (evals) {
    if (evals.filter(function (e) { return e.average !== null; }).length === 0)
        return { value: null, disabled: true, status: null };
    var sum = evals.filter(function (e) { return e.average !== null; }).reduce(function (acc, e) { return acc + (e.average * (e.coefficient || 1)); }, 0);
    var sumCoef = evals.filter(function (e) { return e.average !== null; }).reduce(function (acc, e) { return acc + (e.coefficient || 1); }, 0);
    return { value: sum / sumCoef, disabled: false, status: null };
};
export var getGradesAndAverages = function (account, periodName) { return __awaiter(void 0, void 0, void 0, function () {
    var periods, period, evals, averages, grades;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("skolengo");
                return [4 /*yield*/, getPeriod(account)];
            case 1:
                periods = _a.sent();
                period = periods.find(function (p) { return p.name === periodName; });
                if (!period)
                    throw new Error("La période sélectionnée n'a pas été trouvée.");
                return [4 /*yield*/, account.instance.getEvaluation(undefined, period.id)];
            case 2:
                evals = _a.sent();
                averages = {
                    classOverall: { value: 0, disabled: true, status: null },
                    overall: { value: 0, disabled: true, status: null },
                    subjects: evals.map(function (s) { return (__assign({ classAverage: decodeGradeNumber(s.average), color: s.subject.color || "#888", subjectName: s.subject.label, average: decodeGradeNumber(s.studentAverage) }, getSubjectMinMax(s))); }),
                };
                grades = evals.map(function (e) { return e.evaluations.map(function (f) { return (__assign(__assign({}, f), { evaluation: e })); }); }).flat().map(function (g) {
                    var _a;
                    return ({
                        id: g.id,
                        subjectName: g.evaluation.subject.label,
                        description: g.title || g.topic || "Evaluation",
                        timestamp: g.dateTime ? (new Date(g.dateTime)).getTime() : period.startTimestamp,
                        // Not implemented in Skolengo
                        isBonus: false,
                        isOptional: false,
                        outOf: decodeGradeNumber(g.scale),
                        coefficient: (_a = g.coefficient) !== null && _a !== void 0 ? _a : 1,
                        student: decodeGradeNumber(g.evaluationResult.mark),
                        average: decodeGradeNumber(g.average),
                        max: decodeGradeNumber(g.max),
                        min: decodeGradeNumber(g.min)
                    });
                });
                return [2 /*return*/, { averages: averages, grades: grades }];
        }
    });
}); };
