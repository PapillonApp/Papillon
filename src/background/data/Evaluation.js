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
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getEvaluation, updateEvaluationState } from "../utils/evaluation";
var getDifferences = function (currentEvaluation, updatedEvaluation) {
    return updatedEvaluation.filter(function (updatedItem) {
        return !currentEvaluation.some(function (item) {
            return item.levels === updatedItem.levels &&
                item.coefficient === updatedItem.coefficient;
        });
    });
};
var fetchEvaluation = function () { return __awaiter(void 0, void 0, void 0, function () {
    var account, notificationsTypesPermissions, _a, defaultPeriod, evaluation, updatedEvaluation, differences, _b, evaluationCounts_1, evaluationPreview;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                account = getCurrentAccount();
                notificationsTypesPermissions = account.personalization.notifications;
                _a = getEvaluation(), defaultPeriod = _a.defaultPeriod, evaluation = _a.evaluation;
                if (!(notificationsTypesPermissions === null || notificationsTypesPermissions === void 0 ? void 0 : notificationsTypesPermissions.evaluation)) {
                    return [2 /*return*/, evaluation[defaultPeriod]];
                }
                if (!__DEV__) return [3 /*break*/, 2];
                return [4 /*yield*/, papillonNotify({
                        id: "statusBackground",
                        title: account.name,
                        body: "Récupération des dernières compétences...",
                        android: {
                            progress: {
                                max: 100,
                                current: (100 / 6) * 6,
                                indeterminate: false,
                            },
                        },
                    }, "Status")];
            case 1:
                _d.sent();
                _d.label = 2;
            case 2: return [4 /*yield*/, updateEvaluationState(account, defaultPeriod)];
            case 3:
                _d.sent();
                updatedEvaluation = getEvaluation().evaluation[defaultPeriod];
                differences = getDifferences((_c = evaluation[defaultPeriod]) !== null && _c !== void 0 ? _c : [], updatedEvaluation !== null && updatedEvaluation !== void 0 ? updatedEvaluation : []);
                _b = differences.length;
                switch (_b) {
                    case 0: return [3 /*break*/, 4];
                    case 1: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 4: return [3 /*break*/, 9];
            case 5: return [4 /*yield*/, papillonNotify({
                    id: "".concat(account.name, "-evaluation"),
                    title: "[".concat(account.name, "] Nouvelle comp\u00E9tence en ").concat(differences[0].subjectName),
                    subtitle: defaultPeriod,
                    body: "Titre : ".concat(differences[0].description || "Compétence sans titre", ", Coefficient : ").concat(differences[0].coefficient),
                    data: {
                        accountID: account.localID,
                        page: "EvaluationDocument",
                        parameters: {
                            evaluation: differences[0],
                            allEvaluations: evaluation[defaultPeriod] || [],
                        }
                    }
                }, "Evaluation")];
            case 6:
                _d.sent();
                return [3 /*break*/, 9];
            case 7:
                evaluationCounts_1 = {};
                differences.forEach(function (grade) {
                    evaluationCounts_1[grade.subjectName] =
                        (evaluationCounts_1[grade.subjectName] || 0) + 1;
                });
                evaluationPreview = Object.entries(evaluationCounts_1)
                    .map(function (_a) {
                    var subject = _a[0], count = _a[1];
                    return count > 1 ? "".concat(count, "x ").concat(subject) : subject;
                })
                    .join(", ");
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-evaluation"),
                        subtitle: defaultPeriod,
                        title: "[".concat(account.name, "] Nouvelles comp\u00E9tences"),
                        body: "\n            ".concat(differences.length, " nouvelles comp\u00E9tences :<br />\n            ").concat(evaluationPreview, "\n            "),
                        data: {
                            accountID: account.localID,
                            page: "Evaluation"
                        }
                    }, "Evaluation")];
            case 8:
                _d.sent();
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, updatedEvaluation];
        }
    });
}); };
export { fetchEvaluation };
